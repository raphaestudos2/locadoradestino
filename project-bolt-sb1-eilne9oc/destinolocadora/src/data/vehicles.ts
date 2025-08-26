import { Vehicle } from '../types';

// Fallback vehicles data - used when Supabase is not configured or has no data
export const vehicles: Vehicle[] = [
  {
    id: 'kicks',
    name: 'Nissan Kicks SV 2023',
    category: 'SUV',
    transmission: 'Automático',
    price: 299,
    features: ['Ar condicionado', 'Direção elétrica', 'Vidros elétricos', 'Trava elétrica'],
    images: [
      'https://dezeroacem.com.br/wp-content/uploads/2019/08/Nissan-Kicks-SV-2020-CVT.jpg',
      'https://dsae.s3.amazonaws.com/11187006000560/Fotos/FSK-8A04_02.jpg?u=20250710120807',
      'https://dsae.s3.amazonaws.com/11187006000560/Fotos/FSK-8A04_01.jpg?u=20250710120805'
    ],
    seats: 5,
    fuel: 'Flex',
    brand: 'Nissan',
    model: 'Kicks',
    year: 2023,
    quantity: 2
  },
  {
    id: 'tracker',
    name: 'Chevrolet Tracker Premier',
    category: 'SUV',
    transmission: 'Automático',
    price: 350,
    features: ['Ar condicionado', 'Direção elétrica', 'Vidros elétricos', 'Central multimídia'],
    images: [
      'https://production.autoforce.com/uploads/version/profile_image/10870/model_main_webp_comprar-at-1-0-turbo-pacote-rfc_40a0052de6.png.webp',
      'https://revistacarro.com.br/wp-content/uploads/2024/07/WhatsApp-Image-2024-07-16-at-10.14.46.jpeg',
      'https://cdn.autopapo.com.br/box/uploads/2020/03/16140601/nova-tracker-2021-cambio-automatico.jpg'
    ],
    seats: 5,
    fuel: 'Flex',
    brand: 'Chevrolet',
    model: 'Tracker',
    year: 2023,
    quantity: 1
  },
  {
    id: 'kardian',
    name: 'Renault Kardian Evolution',
    category: 'SUV',
    transmission: 'Automático',
    price: 289,
    features: ['Ar condicionado', 'Direção hidráulica', 'Vidros elétricos', 'Alarme'],
    images: [
      'https://cdn.motor1.com/images/mgl/3WnnQp/s3/renault-kardian-evolution-configurador.jpg',
      'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhGRfKJ2HkDo5m38snppOivsuc9p0eacL7AmEuWDuoB3SX1xe-givcTbC6-EQvKPeXFg16Zm0lT9xo6Eusrx9ZQh1LOOJJhw5X3axrb8Xko1vC5VlEWpkQy2WSGKbvyOnSR0jJSdGC8eLPoF_tuwqfjHpJTsLp8NVlK1LrPAcWQagFK48VtOaxNUlLqs6WP/s2560/Renault-Kardian-Techno-Evolution%20%2824%29.jpg',
      'https://image1.mobiauto.com.br/images/api/images/v1.0/402804250/transform/fl_progressive,f_webp,w_592'
    ],
    seats: 5,
    fuel: 'Flex',
    brand: 'Renault',
    model: 'Kardian',
    year: 2023,
    quantity: 3
  },
  {
    id: 'onix-sedan-auto',
    name: 'Chevrolet Onix Plus Turbo',
    category: 'Sedan',
    transmission: 'Automático',
    price: 240,
    features: ['Ar condicionado', 'Direção elétrica', 'Vidros elétricos', 'Computador de bordo'],
    images: [
      'https://garagem360.com.br/wp-content/uploads/2022/09/Chevrolet-Onix-Plus-2023-3.jpg',
      'https://quatrorodas.abril.com.br/wp-content/uploads/2022/02/FLP9782.jpg?quality=70&strip=info',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEOIZ09KOfrj-BiWweK2jfV3XLUD9koCYUwg&s'
    ],
    seats: 5,
    fuel: 'Flex',
    brand: 'Chevrolet',
    model: 'Onix Sedan',
    year: 2023,
    quantity: 2
  },
  {
    id: 'cronos-auto',
    name: 'Fiat Cronos Precision',
    category: 'Sedan',
    transmission: 'Automático',
    price: 240,
    features: ['Ar condicionado', 'Direção hidráulica', 'Vidros elétricos', 'Central multimídia'],
    images: [
      'https://production.autoforce.com/uploads/version/profile_image/8032/comprar-precision-1-3-automatico_1b077f4f54.png',
      'https://imgsapp.em.com.br/app/noticia_127983242361/2022/09/24/1397527/acabamento-interno_3_73638.jpg',
      'https://s2-autoesporte.glbimg.com/QzgYSGDUL6djBbruCSl0qKr-rN8=/0x0:1400x939/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_cf9d035bf26b4646b105bd958f32089d/internal_photos/bs/2022/f/b/q21dnSRaeDnKgt7EA1og/cronoscvt-06.jpg'
    ],
    seats: 5,
    fuel: 'Flex',
    brand: 'Fiat',
    model: 'Cronos',
    year: 2023,
    quantity: 1
  },
  {
    id: 'onix-sedan-manual',
    name: 'Chevrolet Onix Plus LT',
    category: 'Sedan',
    transmission: 'Manual',
    price: 240,
    features: ['Ar condicionado', 'Direção hidráulica', 'Vidros manuais', 'Trava manual'],
    images: [
      'https://alpes-hub.s3.amazonaws.com/uploads/public/683/f94/e95/683f94e95959c073148265.jpg',
      'https://uploads.vrum.com.br/2023/05/37fc4c78-chevrolet-onix-plus-1.0-cambio-manual-modelo-2022-vermelho-interior-bancos-e-painel-estatico-no-calcamento-1024x683.jpg',
      'https://quatrorodas.abril.com.br/wp-content/uploads/2021/04/ezgif.com-gif-maker3.jpg?quality=70&strip=info&w=720&crop=1'
    ],
    seats: 5,
    fuel: 'Flex',
    brand: 'Chevrolet',
    model: 'Onix Sedan',
    year: 2022,
    quantity: 3
  },
  {
    id: 'cronos-manual',
    name: 'Fiat Cronos Drive',
    category: 'Sedan',
    transmission: 'Manual',
    price: 240,
    features: ['Ar condicionado', 'Direção hidráulica', 'Vidros manuais', 'Rádio MP3'],
    images: [
      'https://production.autoforce.com/uploads/version/profile_image/8032/comprar-precision-1-3-automatico_1b077f4f54.png',
      'https://uploads.diariodopoder.com.br/2022/03/1a80669d-2batch_img_20211222_104425.jpg',
      'https://uploads.automaistv.com.br/2022/07/cronos_10_010-62e2acd414a5a_edited-750x450.jpg'
    ],
    seats: 5,
    fuel: 'Flex',
    brand: 'Fiat',
    model: 'Cronos',
    year: 2022,
    quantity: 2
  },
  {
    id: 'onix-hatch',
    name: 'Chevrolet Onix LT',
    category: 'Hatch',
    transmission: 'Manual',
    price: 195,
    features: ['Ar condicionado', 'Direção hidráulica', 'Vidros manuais', 'Alarme'],
    images: [
      'https://images.prd.kavak.io/eyJidWNrZXQiOiJrYXZhay1pbWFnZXMiLCJrZXkiOiJpbWFnZXMvNDA2ODQ1L0VYVEVSSU9SLWZyb250U2lkZVBpbG90TmVhci0xNzQ2ODE1MjI5Njk5LmpwZWciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjU0MCwiaGVpZ2h0IjozMTAsImJhY2tncm91bmQiOnsiciI6MjU1LCJnIjoyNTUsImIiOjI1NSwiYWxwaGEiOjB9fX19',
      'https://garagem360.com.br/wp-content/uploads/2021/07/Compara-1.0-Chevrolet-Onix-LT-aspirado-2.jpg',
      'https://quatrorodas.abril.com.br/wp-content/uploads/2021/04/ezgif.com-gif-maker3.jpg?quality=70&strip=info&w=720&crop=1'
    ],
    seats: 5,
    fuel: 'Flex',
    brand: 'Chevrolet',
    model: 'Onix Hatch',
    year: 2022,
    quantity: 4
  },
  {
    id: 'polo-track',
    name: 'Volkswagen Polo Track 200 TSI',
    category: 'Hatch',
    transmission: 'Manual',
    price: 195,
    features: ['Ar condicionado', 'Direção elétrica', 'Vidros elétricos', 'Central multimídia'],
    images: [
      'https://img.olx.com.br/images/59/599551172740468.jpg',
      'https://vw-digital-cdn-br.itd.vw.com.br/assets/newsroom-cdn-br-ps/c91f712a-0ecd-47b8-923a-d304612270bd_low.png',
      'https://quatrorodas.abril.com.br/wp-content/uploads/2023/03/Volkswagen-Polo-Track-2023-26.jpeg?quality=70&strip=info&w=720&crop=1'
    ],
    seats: 5,
    fuel: 'Flex',
    brand: 'Volkswagen',
    model: 'Polo Track',
    year: 2022,
    quantity: 2
  }
];