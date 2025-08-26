/*
  # Insert sample data for demonstration

  1. Sample Data
    - Sample vehicles with real Brazilian car models
    - Proper pricing and specifications
    - High-quality images from automotive websites

  2. Safety
    - Use ON CONFLICT DO NOTHING to prevent duplicates
    - Safe for multiple executions
*/

-- Insert sample vehicles
INSERT INTO vehicles (id, name, brand, model, year, license_plate, category, transmission, fuel, seats, daily_rate, features, images, status)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440101', 'Nissan Kicks SV 2023', 'Nissan', 'Kicks', 2023, 'ABC-1234', 'SUV', 'Automático', 'Flex', 5, 299.00, 
   ARRAY['Ar condicionado', 'Direção elétrica', 'Vidros elétricos', 'Trava elétrica'], 
   ARRAY['https://dezeroacem.com.br/wp-content/uploads/2019/08/Nissan-Kicks-SV-2020-CVT.jpg', 'https://dsae.s3.amazonaws.com/11187006000560/Fotos/FSK-8A04_02.jpg?u=20250710120807'], 
   'disponivel'),
  ('550e8400-e29b-41d4-a716-446655440102', 'Chevrolet Tracker Premier', 'Chevrolet', 'Tracker', 2023, 'DEF-5678', 'SUV', 'Automático', 'Flex', 5, 350.00,
   ARRAY['Ar condicionado', 'Direção elétrica', 'Vidros elétricos', 'Central multimídia'],
   ARRAY['https://production.autoforce.com/uploads/version/profile_image/10870/model_main_webp_comprar-at-1-0-turbo-pacote-rfc_40a0052de6.png.webp', 'https://revistacarro.com.br/wp-content/uploads/2024/07/WhatsApp-Image-2024-07-16-at-10.14.46.jpeg'],
   'disponivel'),
  ('550e8400-e29b-41d4-a716-446655440103', 'Chevrolet Onix Plus Turbo', 'Chevrolet', 'Onix Plus', 2023, 'GHI-9012', 'Sedan', 'Automático', 'Flex', 5, 240.00,
   ARRAY['Ar condicionado', 'Direção elétrica', 'Vidros elétricos', 'Computador de bordo'],
   ARRAY['https://garagem360.com.br/wp-content/uploads/2022/09/Chevrolet-Onix-Plus-2023-3.jpg', 'https://quatrorodas.abril.com.br/wp-content/uploads/2022/02/FLP9782.jpg?quality=70&strip=info'],
   'disponivel'),
  ('550e8400-e29b-41d4-a716-446655440104', 'Fiat Cronos Precision', 'Fiat', 'Cronos', 2023, 'JKL-3456', 'Sedan', 'Automático', 'Flex', 5, 240.00,
   ARRAY['Ar condicionado', 'Direção hidráulica', 'Vidros elétricos', 'Central multimídia'],
   ARRAY['https://production.autoforce.com/uploads/version/profile_image/8032/comprar-precision-1-3-automatico_1b077f4f54.png', 'https://imgsapp.em.com.br/app/noticia_127983242361/2022/09/24/1397527/acabamento-interno_3_73638.jpg'],
   'disponivel'),
  ('550e8400-e29b-41d4-a716-446655440105', 'Chevrolet Onix LT', 'Chevrolet', 'Onix', 2022, 'MNO-7890', 'Hatch', 'Manual', 'Flex', 5, 195.00,
   ARRAY['Ar condicionado', 'Direção hidráulica', 'Vidros manuais', 'Alarme'],
   ARRAY['https://images.prd.kavak.io/eyJidWNrZXQiOiJrYXZhay1pbWFnZXMiLCJrZXkiOiJpbWFnZXMvNDA2ODQ1L0VYVEVSSU9SLWZyb250U2lkZVBpbG90TmVhci0xNzQ2ODE1MjI5Njk5LmpwZWciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjU0MCwiaGVpZ2h0IjozMTAsImJhY2tncm91bmQiOnsiciI6MjU1LCJnIjoyNTUsImIiOjI1NSwiYWxwaGEiOjB9fX19', 'https://garagem360.com.br/wp-content/uploads/2021/07/Compara-1.0-Chevrolet-Onix-LT-aspirado-2.jpg'],
   'disponivel')
ON CONFLICT (license_plate) DO NOTHING;