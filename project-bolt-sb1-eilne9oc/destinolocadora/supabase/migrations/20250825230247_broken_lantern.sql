/*
  # Garantir integração completa entre locações e pagamentos

  1. Verificações e Correções
    - Verificar se tabela rental_payments existe
    - Criar função para sincronizar pagamentos automaticamente
    - Garantir que mudanças de status criem registros de pagamento

  2. Trigger Automático
    - Quando rental.payment_status muda para 'pago'
    - Cria automaticamente registro em rental_payments
    - Evita duplicatas e garante integridade

  3. Dados de Exemplo
    - Insere alguns pagamentos de exemplo para teste
*/

-- Verificar e corrigir tabela rental_payments
CREATE TABLE IF NOT EXISTS rental_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE,
  payment_type text NOT NULL CHECK (payment_type IN ('deposito', 'pagamento', 'multa', 'taxa_adicional', 'reembolso')),
  amount numeric(10,2) NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto')),
  payment_date timestamptz DEFAULT now(),
  due_date date,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'processando', 'aprovado', 'rejeitado', 'cancelado')),
  transaction_id text,
  receipt_url text,
  notes text,
  created_by uuid REFERENCES admin_users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rental_payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para rental_payments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rental_payments' AND policyname = 'Admin users can manage payments'
  ) THEN
    CREATE POLICY "Admin users can manage payments"
      ON rental_payments
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM admin_users au 
          WHERE au.user_id = auth.uid() 
          AND au.active = true
        )
      );
  END IF;
END $$;

-- Política para usuários verem seus próprios pagamentos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'rental_payments' AND policyname = 'Users can view their rental payments'
  ) THEN
    CREATE POLICY "Users can view their rental payments"
      ON rental_payments
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM rentals r
          JOIN customers c ON r.customer_id = c.id
          WHERE r.id = rental_payments.rental_id
          AND c.user_id = auth.uid()
        ) OR 
        EXISTS (
          SELECT 1 FROM admin_users au 
          WHERE au.user_id = auth.uid() 
          AND au.active = true
        )
      );
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rental_payments_rental_id ON rental_payments(rental_id);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_rental_payments_updated_at ON rental_payments;
CREATE TRIGGER update_rental_payments_updated_at
  BEFORE UPDATE ON rental_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para criar pagamento automático quando locação for marcada como paga
CREATE OR REPLACE FUNCTION create_automatic_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Só executa se payment_status mudou para 'pago' e não era 'pago' antes
  IF NEW.payment_status = 'pago' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'pago') THEN
    -- Verifica se já existe um pagamento para esta locação
    IF NOT EXISTS (
      SELECT 1 FROM rental_payments 
      WHERE rental_id = NEW.id 
      AND payment_type = 'pagamento'
      AND status = 'aprovado'
    ) THEN
      -- Cria o registro de pagamento automaticamente
      INSERT INTO rental_payments (
        rental_id,
        payment_type,
        amount,
        payment_method,
        payment_date,
        status,
        notes
      ) VALUES (
        NEW.id,
        'pagamento',
        NEW.total_amount,
        'dinheiro',
        now(),
        'aprovado',
        'Pagamento automático da locação #' || substring(NEW.id::text from 1 for 8)
      );
      
      RAISE NOTICE 'Pagamento automático criado para locação %', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar pagamento automático
DROP TRIGGER IF EXISTS create_automatic_payment_trigger ON rentals;
CREATE TRIGGER create_automatic_payment_trigger
  AFTER UPDATE OF payment_status ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION create_automatic_payment();

-- Inserir alguns pagamentos de exemplo (só se não existirem)
DO $$
DECLARE
  rental_record RECORD;
BEGIN
  -- Para cada locação paga, criar um pagamento se não existir
  FOR rental_record IN 
    SELECT id, total_amount, customer_id 
    FROM rentals 
    WHERE payment_status = 'pago'
  LOOP
    -- Verifica se já existe pagamento
    IF NOT EXISTS (
      SELECT 1 FROM rental_payments 
      WHERE rental_id = rental_record.id 
      AND payment_type = 'pagamento'
    ) THEN
      INSERT INTO rental_payments (
        rental_id,
        payment_type,
        amount,
        payment_method,
        payment_date,
        status,
        notes
      ) VALUES (
        rental_record.id,
        'pagamento',
        rental_record.total_amount,
        'dinheiro',
        now(),
        'aprovado',
        'Pagamento automático da locação'
      );
    END IF;
  END LOOP;
END $$;