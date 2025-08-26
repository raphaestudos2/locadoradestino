/*
  # Adicionar campo quantidade para veículos

  1. Alterações na tabela
    - Adicionar campo `quantity` (integer) na tabela `vehicles`
    - Valor padrão: 1 (um veículo)
    - Permite controle de quantos veículos do mesmo modelo existem
    
  2. Atualização de dados
    - Define quantidade 1 para todos os veículos existentes
    - Permite expansão futura da frota

  3. Indexação
    - Índice para consultas rápidas por quantidade disponível
*/

-- Adicionar campo quantity na tabela vehicles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN quantity integer DEFAULT 1 NOT NULL;
  END IF;
END $$;

-- Atualizar veículos existentes para ter quantidade 1
UPDATE vehicles SET quantity = 1 WHERE quantity IS NULL;

-- Criar índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_vehicles_quantity ON vehicles(quantity);

-- Comentário na coluna
COMMENT ON COLUMN vehicles.quantity IS 'Quantidade de veículos disponíveis deste modelo/configuração';