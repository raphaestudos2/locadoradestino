/*
  # Adicionar coluna name para veículos

  1. Nova Coluna
    - `name` (text) - Nome personalizado do veículo para exibição

  2. Atualização de Dados
    - Popula a coluna name com brand + model para veículos existentes
    - Permite nomes personalizados para novos veículos

  3. Observações
    - Campo opcional, mas quando preenchido será usado na listagem
    - Fallback para brand + model quando name estiver vazio
*/

-- Adicionar coluna name à tabela vehicles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'name'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN name text;
  END IF;
END $$;

-- Atualizar veículos existentes com name baseado em brand + model
UPDATE vehicles 
SET name = CONCAT(brand, ' ', model)
WHERE name IS NULL OR name = '';