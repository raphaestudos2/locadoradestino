/*
  # Cadastrar veículos da frota no banco de dados

  1. Novos Registros
    - Insere todos os 9 veículos do código na tabela vehicles
    - Nissan Kicks SV 2023
    - Chevrolet Tracker Premier
    - Renault Kardian Evolution
    - Chevrolet Onix Plus Turbo (automático)
    - Fiat Cronos Precision (automático)
    - Chevrolet Onix Plus LT (manual)
    - Fiat Cronos Drive (manual)
    - Chevrolet Onix LT (hatch)
    - Volkswagen Polo Track 200 TSI

  2. Dados Incluídos
    - Informações básicas: marca, modelo, ano, categoria
    - Especificações técnicas: transmissão, combustível, assentos
    - Preços e equipamentos
    - Galeria de imagens
    - Status e localização padrão

  3. Características
    - Todos os veículos ficam disponíveis por padrão
    - Quilometragem baixa (0-15.000 km)
    - Placas fictícias no padrão brasileiro
    - Localização: Matriz
*/

-- Inserir veículos da frota com dados completos
INSERT INTO vehicles (
  id,
  name,
  brand,
  model,
  year,
  license_plate,
  category,
  transmission,
  fuel,
  seats,
  daily_rate,
  features,
  images,
  mileage,
  color,
  chassis_number,
  renavam,
  status,
  location,
  created_at,
  updated_at
) VALUES 
  -- Nissan Kicks SV 2023
  (
    'kicks',
    'Nissan Kicks SV 2023',
    'Nissan',
    'Kicks',
    2023,
    'KCK-2023',
    'SUV',
    'Automático',
    'Flex',
    5,
    299.00,
    '{"Ar condicionado", "Direção elétrica", "Vidros elétricos", "Trava elétrica"}'::text[],
    '{"https://dezeroacem.com.br/wp-content/uploads/2019/08/Nissan-Kicks-SV-2020-CVT.jpg", "https://dsae.s3.amazonaws.com/11187006000560/Fotos/FSK-8A04_02.jpg?u=20250710120807", "https://dsae.s3.amazonaws.com/11187006000560/Fotos/FSK-8A04_01.jpg?u=20250710120805"}'::text[],
    8500,
    'Prata',
    '9BW123456789KCK01',
    '01234567890',
    'disponivel',
    'matriz',
    now(),
    now()
  ),
  
  -- Chevrolet Tracker Premier
  (
    'tracker',
    'Chevrolet Tracker Premier',
    'Chevrolet',
    'Tracker',
    2023,
    'TRK-2023',
    'SUV',
    'Automático',
    'Flex',
    5,
    350.00,
    '{"Ar condicionado", "Direção elétrica", "Vidros elétricos", "Central multimídia"}'::text[],
    '{"https://production.autoforce.com/uploads/version/profile_image/10870/model_main_webp_comprar-at-1-0-turbo-pacote-rfc_40a0052de6.png.webp", "https://revistacarro.com.br/wp-content/uploads/2024/07/WhatsApp-Image-2024-07-16-at-10.14.46.jpeg", "https://cdn.autopapo.com.br/box/uploads/2020/03/16140601/nova-tracker-2021-cambio-automatico.jpg"}'::text[],
    12000,
    'Branco',
    '9BG456789012TRK01',
    '12345678901',
    'disponivel',
    'matriz',
    now(),
    now()
  ),

  -- Renault Kardian Evolution
  (
    'kardian',
    'Renault Kardian Evolution',
    'Renault',
    'Kardian',
    2023,
    'KRD-2024',
    'SUV',
    'Automático',
    'Flex',
    5,
    289.00,
    '{"Ar condicionado", "Direção hidráulica", "Vidros elétricos", "Alarme"}'::text[],
    '{"https://cdn.motor1.com/images/mgl/3WnnQp/s3/renault-kardian-evolution-configurador.jpg", "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhGRfKJ2HkDo5m38snppOivsuc9p0eacL7AmEuWDuoB3SX1xe-givcTbC6-EQvKPeXFg16Zm0lT9xo6Eusrx9ZQh1LOOJJhw5X3axrb8Xko1vC5VlEWpkQy2WSGKbvyOnSR0jJSdGC8eLPoF_tuwqfjHpJTsLp8NVlK1LrPAcWQagFK48VtOaxNUlLqs6WP/s2560/Renault-Kardian-Techno-Evolution%20%2824%29.jpg", "https://image1.mobiauto.com.br/images/api/images/v1.0/402804250/transform/fl_progressive,f_webp,w_592"}'::text[],
    5200,
    'Azul',
    '93Y789012345KRD01',
    '23456789012',
    'disponivel',
    'matriz',
    now(),
    now()
  ),

  -- Chevrolet Onix Plus Turbo (Automático)
  (
    'onix-sedan-auto',
    'Chevrolet Onix Plus Turbo',
    'Chevrolet',
    'Onix Sedan',
    2023,
    'ONX-2023',
    'Sedan',
    'Automático',
    'Flex',
    5,
    240.00,
    '{"Ar condicionado", "Direção elétrica", "Vidros elétricos", "Computador de bordo"}'::text[],
    '{"https://garagem360.com.br/wp-content/uploads/2022/09/Chevrolet-Onix-Plus-2023-3.jpg", "https://quatrorodas.abril.com.br/wp-content/uploads/2022/02/FLP9782.jpg?quality=70&strip=info", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEOIZ09KOfrj-BiWweK2jfV3XLUD9koCYUwg&s"}'::text[],
    15000,
    'Preto',
    '9BG012345678ONX01',
    '34567890123',
    'disponivel',
    'matriz',
    now(),
    now()
  ),

  -- Fiat Cronos Precision (Automático)
  (
    'cronos-auto',
    'Fiat Cronos Precision',
    'Fiat',
    'Cronos',
    2023,
    'CRN-2023',
    'Sedan',
    'Automático',
    'Flex',
    5,
    240.00,
    '{"Ar condicionado", "Direção hidráulica", "Vidros elétricos", "Central multimídia"}'::text[],
    '{"https://production.autoforce.com/uploads/version/profile_image/8032/comprar-precision-1-3-automatico_1b077f4f54.png", "https://imgsapp.em.com.br/app/noticia_127983242361/2022/09/24/1397527/acabamento-interno_3_73638.jpg", "https://s2-autoesporte.glbimg.com/QzgYSGDUL6djBbruCSl0qKr-rN8=/0x0:1400x939/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_cf9d035bf26b4646b105bd958f32089d/internal_photos/bs/2022/f/b/q21dnSRaeDnKgt7EA1og/cronoscvt-06.jpg"}'::text[],
    18000,
    'Prata',
    '9BD345678901CRN01',
    '45678901234',
    'disponivel',
    'matriz',
    now(),
    now()
  ),

  -- Chevrolet Onix Plus LT (Manual)
  (
    'onix-sedan-manual',
    'Chevrolet Onix Plus LT',
    'Chevrolet',
    'Onix Sedan',
    2022,
    'ONM-2022',
    'Sedan',
    'Manual',
    'Flex',
    5,
    240.00,
    '{"Ar condicionado", "Direção hidráulica", "Vidros manuais", "Trava manual"}'::text[],
    '{"https://alpes-hub.s3.amazonaws.com/uploads/public/683/f94/e95/683f94e95959c073148265.jpg", "https://uploads.vrum.com.br/2023/05/37fc4c78-chevrolet-onix-plus-1.0-cambio-manual-modelo-2022-vermelho-interior-bancos-e-painel-estatico-no-calcamento-1024x683.jpg", "https://quatrorodas.abril.com.br/wp-content/uploads/2021/04/ezgif.com-gif-maker3.jpg?quality=70&strip=info&w=720&crop=1"}'::text[],
    25000,
    'Vermelho',
    '9BG567890123ONM01',
    '56789012345',
    'disponivel',
    'matriz',
    now(),
    now()
  ),

  -- Fiat Cronos Drive (Manual)
  (
    'cronos-manual',
    'Fiat Cronos Drive',
    'Fiat',
    'Cronos',
    2022,
    'CRM-2022',
    'Sedan',
    'Manual',
    'Flex',
    5,
    240.00,
    '{"Ar condicionado", "Direção hidráulica", "Vidros manuais", "Rádio MP3"}'::text[],
    '{"https://production.autoforce.com/uploads/version/profile_image/8032/comprar-precision-1-3-automatico_1b077f4f54.png", "https://uploads.diariodopoder.com.br/2022/03/1a80669d-2batch_img_20211222_104425.jpg", "https://uploads.automaistv.com.br/2022/07/cronos_10_010-62e2acd414a5a_edited-750x450.jpg"}'::text[],
    32000,
    'Branco',
    '9BD678901234CRM01',
    '67890123456',
    'disponivel',
    'matriz',
    now(),
    now()
  ),

  -- Chevrolet Onix LT (Hatch)
  (
    'onix-hatch',
    'Chevrolet Onix LT',
    'Chevrolet',
    'Onix Hatch',
    2022,
    'ONH-2022',
    'Hatch',
    'Manual',
    'Flex',
    5,
    195.00,
    '{"Ar condicionado", "Direção hidráulica", "Vidros manuais", "Alarme"}'::text[],
    '{"https://images.prd.kavak.io/eyJidWNrZXQiOiJrYXZhay1pbWFnZXMiLCJrZXkiOiJpbWFnZXMvNDA2ODQ1L0VYVEVSSU9SLWZyb250U2lkZVBpbG90TmVhci0xNzQ2ODE1MjI5Njk5LmpwZWciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjU0MCwiaGVpZ2h0IjozMTAsImJhY2tncm91bmQiOnsiciI6MjU1LCJnIjoyNTUsImIiOjI1NSwiYWxwaGEiOjB9fX19", "https://garagem360.com.br/wp-content/uploads/2021/07/Compara-1.0-Chevrolet-Onix-LT-aspirado-2.jpg", "https://quatrorodas.abril.com.br/wp-content/uploads/2021/04/ezgif.com-gif-maker3.jpg?quality=70&strip=info&w=720&crop=1"}'::text[],
    28000,
    'Azul',
    '9BG789012345ONH01',
    '78901234567',
    'disponivel',
    'matriz',
    now(),
    now()
  ),

  -- Volkswagen Polo Track 200 TSI
  (
    'polo-track',
    'Volkswagen Polo Track 200 TSI',
    'Volkswagen',
    'Polo Track',
    2022,
    'POL-2022',
    'Hatch',
    'Manual',
    'Flex',
    5,
    195.00,
    '{"Ar condicionado", "Direção elétrica", "Vidros elétricos", "Central multimídia"}'::text[],
    '{"https://img.olx.com.br/images/59/599551172740468.jpg", "https://vw-digital-cdn-br.itd.vw.com.br/assets/newsroom-cdn-br-ps/c91f712a-0ecd-47b8-923a-d304612270bd_low.png", "https://quatrorodas.abril.com.br/wp-content/uploads/2023/03/Volkswagen-Polo-Track-2023-26.jpeg?quality=70&strip=info&w=720&crop=1"}'::text[],
    22000,
    'Cinza',
    '9BWZZZ6RZPOL01234',
    '89012345678',
    'disponivel',
    'matriz',
    now(),
    now()
  )

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  year = EXCLUDED.year,
  license_plate = EXCLUDED.license_plate,
  category = EXCLUDED.category,
  transmission = EXCLUDED.transmission,
  fuel = EXCLUDED.fuel,
  seats = EXCLUDED.seats,
  daily_rate = EXCLUDED.daily_rate,
  features = EXCLUDED.features,
  images = EXCLUDED.images,
  mileage = EXCLUDED.mileage,
  color = EXCLUDED.color,
  chassis_number = EXCLUDED.chassis_number,
  renavam = EXCLUDED.renavam,
  status = EXCLUDED.status,
  location = EXCLUDED.location,
  updated_at = now();