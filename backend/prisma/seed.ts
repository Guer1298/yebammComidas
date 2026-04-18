import 'dotenv/config'
import {
  PrismaClient,
  EventType,
  PostStatus,
  PromotionStatus,
  MediaType,
} from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hashPassword } from '../src/shared/utils/hash'

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL en el entorno. Revisa tu archivo .env')
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  // 1. Usuario
  const userEmail = 'usuario@seed.com'

  let user = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  if (!user) {
    const passwordHash = await hashPassword('password123')

    user = await prisma.user.create({
      data: {
        name: 'Usuario Semilla',
        email: userEmail,
        passwordHash,
      },
    })
  }

  if (!user) {
    throw new Error('No se pudo crear o cargar el usuario semilla.')
  }

  // 1.b Usuario administrador del negocio
  const adminEmail = 'admin@burgerlab.com'

  let adminUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (!adminUser) {
    const passwordHash = await hashPassword('Admin123!')

    adminUser = await prisma.user.create({
      data: {
        name: 'Admin Burger Lab',
        email: adminEmail,
        passwordHash,
        role: 'BUSINESS_ADMIN',
      },
    })
  } else if (adminUser.role !== 'BUSINESS_ADMIN') {
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        role: 'BUSINESS_ADMIN',
      },
    })
  }

  // 2. Negocio
  const businessSlug = 'burger-lab'

  let business = await prisma.business.findUnique({
    where: { slug: businessSlug },
  })

  if (!business) {
    business = await prisma.business.create({
      data: {
        name: 'Burger Lab',
        slug: businessSlug,
        category: 'Hamburguesería',
        businessType: 'Restaurante',
        description: 'Hamburguesas artesanales y papas especiales',
        aboutArticle:
          'Burger Lab es un negocio enfocado en hamburguesas artesanales, productos visualmente atractivos y atención rápida.',
        city: 'Bogotá',
        address: 'Calle 123 #45-67',
        phone: '3000000000',
        whatsapp: '573000000000',
        email: 'contacto@burgerlab.com',
        instagram: '@burgerlab',
        isActive: true,
      },
    })
  }

  if (!business) {
    throw new Error('No se pudo crear o cargar el negocio semilla.')
  }

  const businessAdmin = await prisma.businessAdmin.findUnique({
    where: {
      userId_businessId: {
        userId: adminUser.id,
        businessId: business.id,
      },
    },
  })

  if (!businessAdmin) {
    await prisma.businessAdmin.create({
      data: {
        userId: adminUser.id,
        businessId: business.id,
        displayName: 'Administrador principal',
        title: 'Dueño / Admin',
        isPrimary: true,
        isVisibleOnProfile: true,
      },
    })
  }

  // 3. Menú
  let menu = await prisma.menu.findFirst({
    where: {
      businessId: business.id,
      name: 'Menú principal',
    },
  })

  if (!menu) {
    menu = await prisma.menu.create({
      data: {
        businessId: business.id,
        name: 'Menú principal',
        description: 'Menú principal del negocio',
        isActive: true,
        sortOrder: 1,
      },
    })
  }

  // 4. Categoría del menú
  let category = await prisma.menuCategory.findFirst({
    where: {
      menuId: menu.id,
      name: 'Hamburguesas y acompañamientos',
    },
  })

  if (!category) {
    category = await prisma.menuCategory.create({
      data: {
        menuId: menu.id,
        name: 'Hamburguesas y acompañamientos',
        description: 'Categoría principal del negocio',
        isActive: true,
        sortOrder: 1,
      },
    })
  }

  // 5. Producto 1
  let burger = await prisma.product.findFirst({
    where: {
      businessId: business.id,
      slug: 'burger-clasica',
    },
  })

  if (!burger) {
    burger = await prisma.product.create({
      data: {
        businessId: business.id,
        categoryId: category.id,
        name: 'Burger Clásica',
        slug: 'burger-clasica',
        shortDescription: 'Hamburguesa clásica artesanal',
        description: 'Pan brioche, carne, queso cheddar y salsa de la casa.',
        ingredients: 'Pan brioche, carne, cheddar, salsa de la casa',
        price: 22000,
        currency: 'COP',
        imageUrl: 'https://placehold.co/600x400',
        isFeatured: true,
        isActive: true,
        sortOrder: 1,
      },
    })
  }

  // 6. Producto 2
  let fries = await prisma.product.findFirst({
    where: {
      businessId: business.id,
      slug: 'papas-lab',
    },
  })

  if (!fries) {
    fries = await prisma.product.create({
      data: {
        businessId: business.id,
        categoryId: category.id,
        name: 'Papas Lab',
        slug: 'papas-lab',
        shortDescription: 'Papas con salsa especial',
        description: 'Papas crocantes con salsa especial de la casa.',
        ingredients: 'Papas, salsa especial',
        price: 14000,
        currency: 'COP',
        imageUrl: 'https://placehold.co/600x400',
        isFeatured: false,
        isActive: true,
        sortOrder: 2,
      },
    })
  }

  // 7. Media assets del negocio
  const primaryMedia = await prisma.mediaAsset.findFirst({
    where: {
      businessId: business.id,
      isPrimary: true,
    },
  })

  if (!primaryMedia) {
    await prisma.mediaAsset.create({
      data: {
        businessId: business.id,
        type: MediaType.IMAGE,
        url: 'https://placehold.co/800x600',
        thumbnailUrl: 'https://placehold.co/400x300',
        altText: 'Portada Burger Lab',
        title: 'Portada principal',
        caption: 'Imagen principal del negocio',
        isPrimary: true,
        sortOrder: 1,
      },
    })
  }

  // 8. Media asset de producto
  const burgerMedia = await prisma.mediaAsset.findFirst({
    where: {
      businessId: business.id,
      productId: burger.id,
      url: 'https://placehold.co/600x400?text=Burger+Clasica',
    },
  })

  if (!burgerMedia) {
    await prisma.mediaAsset.create({
      data: {
        businessId: business.id,
        productId: burger.id,
        type: MediaType.IMAGE,
        url: 'https://placehold.co/600x400?text=Burger+Clasica',
        thumbnailUrl: 'https://placehold.co/300x200?text=Burger+Clasica',
        altText: 'Burger Clásica',
        title: 'Burger Clásica',
        caption: 'Producto destacado',
        isPrimary: false,
        sortOrder: 2,
      },
    })
  }

  // 9. Promoción
  let promotion = await prisma.promotion.findFirst({
    where: {
      businessId: business.id,
      slug: 'dos-por-uno-burger-clasica',
    },
  })

  if (!promotion) {
    promotion = await prisma.promotion.create({
      data: {
        businessId: business.id,
        title: '2x1 en Burger Clásica',
        slug: 'dos-por-uno-burger-clasica',
        description: 'Promoción válida los viernes',
        imageUrl: 'https://placehold.co/600x400',
        ctaLabel: 'Pedir ahora',
        ctaUrl: 'https://wa.me/573000000000',
        status: PromotionStatus.ACTIVE,
        isHighlighted: true,
      },
    })
  }

  // 10. Post
  let post = await prisma.post.findFirst({
    where: {
      businessId: business.id,
      slug: 'nueva-receta-de-la-casa',
    },
  })

  if (!post) {
    post = await prisma.post.create({
      data: {
        businessId: business.id,
        title: 'Nueva receta de la casa',
        slug: 'nueva-receta-de-la-casa',
        excerpt: 'Presentamos una nueva burger especial.',
        content:
          'Lanzamos una nueva burger especial para quienes buscan un sabor más intenso y artesanal.',
        coverImageUrl: 'https://placehold.co/600x400',
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    })
  }

  // 11. FAQ
  const faq = await prisma.fAQ.findFirst({
    where: {
      businessId: business.id,
      question: '¿Tienen domicilio?',
    },
  })

  if (!faq) {
    await prisma.fAQ.create({
      data: {
        businessId: business.id,
        question: '¿Tienen domicilio?',
        answer: 'Sí, a través de WhatsApp.',
        sortOrder: 1,
        isActive: true,
      },
    })
  }

  // 12. Review
  const review = await prisma.review.findFirst({
    where: {
      businessId: business.id,
      userId: user.id,
    },
  })

  if (!review) {
    await prisma.review.create({
      data: {
        businessId: business.id,
        userId: user.id,
        rating: 5,
        comment: 'Muy buena hamburguesa.',
        isVisible: true,
      },
    })
  }

  // 14. Heladería nueva
  const iceCreamAdminEmail = 'admin@heladeriaaurora.com'

  let iceCreamAdmin = await prisma.user.findUnique({
    where: { email: iceCreamAdminEmail },
  })

  if (!iceCreamAdmin) {
    const passwordHash = await hashPassword('Admin123!')

    iceCreamAdmin = await prisma.user.create({
      data: {
        name: 'Admin Heladería Aurora',
        email: iceCreamAdminEmail,
        passwordHash,
        role: 'BUSINESS_ADMIN',
      },
    })
  } else if (iceCreamAdmin.role !== 'BUSINESS_ADMIN') {
    iceCreamAdmin = await prisma.user.update({
      where: { id: iceCreamAdmin.id },
      data: {
        role: 'BUSINESS_ADMIN',
      },
    })
  }

  const iceCreamBusinessSlug = 'heladeria-aurora'

  let iceCreamBusiness = await prisma.business.findUnique({
    where: { slug: iceCreamBusinessSlug },
  })

  if (!iceCreamBusiness) {
    iceCreamBusiness = await prisma.business.create({
      data: {
        name: 'Heladería Aurora',
        slug: iceCreamBusinessSlug,
        category: 'Heladería',
        businessType: 'Helados y postres',
        description: 'Helados artesanales, malteadas y postres fríos.',
        aboutArticle:
          'Heladería Aurora es una marca pensada para postres frescos, sabores clásicos y combinaciones especiales con ingredientes de calidad.',
        city: 'Bogotá',
        address: 'Calle 85 #11-42',
        phone: '3105552233',
        whatsapp: '573105552233',
        email: 'hola@heladeriaaurora.com',
        instagram: '@heladeriaaurora',
        isActive: true,
      },
    })
  }

  if (!iceCreamBusiness) {
    throw new Error('No se pudo crear o cargar la heladería semilla.')
  }

  const iceCreamBusinessAdmin = await prisma.businessAdmin.findUnique({
    where: {
      userId_businessId: {
        userId: iceCreamAdmin.id,
        businessId: iceCreamBusiness.id,
      },
    },
  })

  if (!iceCreamBusinessAdmin) {
    await prisma.businessAdmin.create({
      data: {
        userId: iceCreamAdmin.id,
        businessId: iceCreamBusiness.id,
        displayName: 'Administrador de Heladería Aurora',
        title: 'Dueño / Admin',
        isPrimary: true,
        isVisibleOnProfile: true,
      },
    })
  }

  let iceCreamMenu = await prisma.menu.findFirst({
    where: {
      businessId: iceCreamBusiness.id,
      name: 'Menú principal',
    },
  })

  if (!iceCreamMenu) {
    iceCreamMenu = await prisma.menu.create({
      data: {
        businessId: iceCreamBusiness.id,
        name: 'Menú principal',
        description: 'Menú principal de Heladería Aurora',
        isActive: true,
        sortOrder: 1,
      },
    })
  }

  let iceCreamCategory = await prisma.menuCategory.findFirst({
    where: {
      menuId: iceCreamMenu.id,
      name: 'Helados y postres',
    },
  })

  if (!iceCreamCategory) {
    iceCreamCategory = await prisma.menuCategory.create({
      data: {
        menuId: iceCreamMenu.id,
        name: 'Helados y postres',
        description: 'Sabores clásicos, malteadas y postres fríos',
        isActive: true,
        sortOrder: 1,
      },
    })
  }

  const iceCreamProducts = [
    {
      name: 'Helado de Vainilla',
      slug: 'helado-de-vainilla',
      shortDescription: 'Clásico, cremoso y suave.',
      description: 'Helado artesanal de vainilla con textura cremosa y sabor equilibrado.',
      ingredients: 'Leche, crema, vainilla, azúcar',
      price: 9000,
      imageUrl: 'https://placehold.co/600x400?text=Vainilla',
    },
    {
      name: 'Helado de Chocolate',
      slug: 'helado-de-chocolate',
      shortDescription: 'Chocolate intenso y artesanal.',
      description: 'Helado de chocolate con cacao real y acabado suave.',
      ingredients: 'Leche, cacao, crema, azúcar',
      price: 9500,
      imageUrl: 'https://placehold.co/600x400?text=Chocolate',
    },
    {
      name: 'Helado de Fresa',
      slug: 'helado-de-fresa',
      shortDescription: 'Fresco, frutal y ligero.',
      description: 'Helado de fresa con fruta natural y un sabor refrescante.',
      ingredients: 'Fresa, leche, crema, azúcar',
      price: 9200,
      imageUrl: 'https://placehold.co/600x400?text=Fresa',
    },
    {
      name: 'Helado de Arequipe',
      slug: 'helado-de-arequipe',
      shortDescription: 'Dulce y muy colombiano.',
      description: 'Helado de arequipe con sabor profundo y textura cremosa.',
      ingredients: 'Leche, arequipe, crema, azúcar',
      price: 9900,
      imageUrl: 'https://placehold.co/600x400?text=Arequipe',
    },
    {
      name: 'Sundae Clásico',
      slug: 'sundae-clasico',
      shortDescription: 'Salsa, helado y topping.',
      description: 'Sundae con helado de vainilla, salsa de chocolate y cereza.',
      ingredients: 'Helado, salsa de chocolate, toppings',
      price: 12500,
      imageUrl: 'https://placehold.co/600x400?text=Sundae',
    },
    {
      name: 'Banana Split',
      slug: 'banana-split',
      shortDescription: 'Postre completo y abundante.',
      description: 'Banana split con tres sabores, banano, salsa y toppings.',
      ingredients: 'Banano, helado, crema, salsa, toppings',
      price: 16900,
      imageUrl: 'https://placehold.co/600x400?text=Banana+Split',
    },
    {
      name: 'Malteada de Vainilla',
      slug: 'malteada-de-vainilla',
      shortDescription: 'Suave y cremosa.',
      description: 'Malteada fría de vainilla con crema batida.',
      ingredients: 'Leche, helado de vainilla, crema batida',
      price: 11900,
      imageUrl: 'https://placehold.co/600x400?text=Malteada+Vainilla',
    },
    {
      name: 'Malteada de Chocolate',
      slug: 'malteada-de-chocolate',
      shortDescription: 'Chocolate espeso y frío.',
      description: 'Malteada de chocolate con cacao intenso y topping crocante.',
      ingredients: 'Leche, helado de chocolate, cacao, toppings',
      price: 12500,
      imageUrl: 'https://placehold.co/600x400?text=Malteada+Chocolate',
    },
    {
      name: 'Paleta Frutal',
      slug: 'paleta-frutal',
      shortDescription: 'Refrescante y natural.',
      description: 'Paleta artesanal de frutas tropicales.',
      ingredients: 'Fruta natural, agua, azúcar',
      price: 5500,
      imageUrl: 'https://placehold.co/600x400?text=Paleta+Frutal',
    },
    {
      name: 'Brownie con Helado',
      slug: 'brownie-con-helado',
      shortDescription: 'Caliente y frío en un solo postre.',
      description: 'Brownie de chocolate acompañado de helado de vainilla.',
      ingredients: 'Brownie, helado de vainilla, sirope',
      price: 14900,
      imageUrl: 'https://placehold.co/600x400?text=Brownie+%2B+Helado',
    },
  ]

  for (let index = 0; index < iceCreamProducts.length; index += 1) {
    const productData = iceCreamProducts[index]

    const existingProduct = await prisma.product.findFirst({
      where: {
        businessId: iceCreamBusiness.id,
        slug: productData.slug,
      },
    })

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          businessId: iceCreamBusiness.id,
          categoryId: iceCreamCategory.id,
          name: productData.name,
          slug: productData.slug,
          shortDescription: productData.shortDescription,
          description: productData.description,
          ingredients: productData.ingredients,
          price: productData.price,
          currency: 'COP',
          imageUrl: productData.imageUrl,
          isFeatured: index < 3,
          isActive: true,
          sortOrder: index + 1,
        },
      })
    }
  }

  const iceCreamPrimaryMedia = await prisma.mediaAsset.findFirst({
    where: {
      businessId: iceCreamBusiness.id,
      isPrimary: true,
    },
  })

  if (!iceCreamPrimaryMedia) {
    await prisma.mediaAsset.create({
      data: {
        businessId: iceCreamBusiness.id,
        type: MediaType.IMAGE,
        url: 'https://placehold.co/800x600?text=Heladeria+Aurora',
        thumbnailUrl: 'https://placehold.co/400x300?text=Heladeria+Aurora',
        altText: 'Portada Heladería Aurora',
        title: 'Portada principal',
        caption: 'Imagen principal de la heladería',
        isPrimary: true,
        sortOrder: 1,
      },
    })
  }

  // 15. Negocio de comida típica colombiana
  const colombianAdminEmail = 'admin@saboresdecolombia.com'

  let colombianAdmin = await prisma.user.findUnique({
    where: { email: colombianAdminEmail },
  })

  if (!colombianAdmin) {
    const passwordHash = await hashPassword('Admin123!')

    colombianAdmin = await prisma.user.create({
      data: {
        name: 'Admin Sabores de Colombia',
        email: colombianAdminEmail,
        passwordHash,
        role: 'BUSINESS_ADMIN',
      },
    })
  } else if (colombianAdmin.role !== 'BUSINESS_ADMIN') {
    colombianAdmin = await prisma.user.update({
      where: { id: colombianAdmin.id },
      data: {
        role: 'BUSINESS_ADMIN',
      },
    })
  }

  const colombianBusinessSlug = 'sabores-de-colombia'

  let colombianBusiness = await prisma.business.findUnique({
    where: { slug: colombianBusinessSlug },
  })

  if (!colombianBusiness) {
    colombianBusiness = await prisma.business.create({
      data: {
        name: 'Sabores de Colombia',
        slug: colombianBusinessSlug,
        category: 'Comida típica colombiana',
        businessType: 'Restaurante tradicional',
        description: 'Bandeja paisa, ajiaco, sancocho y platos tradicionales.',
        aboutArticle:
          'Sabores de Colombia reúne recetas tradicionales del país con ingredientes frescos y porciones generosas para almuerzo y domicilio.',
        city: 'Medellín',
        address: 'Carrera 70 #42-18',
        phone: '3214448899',
        whatsapp: '573214448899',
        email: 'hola@saboresdecolombia.com',
        instagram: '@saboresdecolombia',
        isActive: true,
      },
    })
  }

  if (!colombianBusiness) {
    throw new Error('No se pudo crear o cargar el negocio de comida típica.')
  }

  const colombianBusinessAdmin = await prisma.businessAdmin.findUnique({
    where: {
      userId_businessId: {
        userId: colombianAdmin.id,
        businessId: colombianBusiness.id,
      },
    },
  })

  if (!colombianBusinessAdmin) {
    await prisma.businessAdmin.create({
      data: {
        userId: colombianAdmin.id,
        businessId: colombianBusiness.id,
        displayName: 'Administrador de Sabores de Colombia',
        title: 'Dueño / Admin',
        isPrimary: true,
        isVisibleOnProfile: true,
      },
    })
  }

  let colombianMenu = await prisma.menu.findFirst({
    where: {
      businessId: colombianBusiness.id,
      name: 'Menú principal',
    },
  })

  if (!colombianMenu) {
    colombianMenu = await prisma.menu.create({
      data: {
        businessId: colombianBusiness.id,
        name: 'Menú principal',
        description: 'Menú principal de Sabores de Colombia',
        isActive: true,
        sortOrder: 1,
      },
    })
  }

  let colombianCategory = await prisma.menuCategory.findFirst({
    where: {
      menuId: colombianMenu.id,
      name: 'Platos típicos',
    },
  })

  if (!colombianCategory) {
    colombianCategory = await prisma.menuCategory.create({
      data: {
        menuId: colombianMenu.id,
        name: 'Platos típicos',
        description: 'Clásicos de la cocina colombiana',
        isActive: true,
        sortOrder: 1,
      },
    })
  }

  const colombianProducts = [
    {
      name: 'Bandeja Paisa',
      slug: 'bandeja-paisa',
      shortDescription: 'El clásico más completo.',
      description:
        'Bandeja paisa con arroz, frijoles, carne molida, chicharrón, chorizo, huevo y plátano maduro.',
      ingredients: 'Arroz, frijoles, carne molida, chicharrón, chorizo, huevo, plátano',
      price: 28000,
      imageUrl: 'https://placehold.co/600x400?text=Bandeja+Paisa',
    },
    {
      name: 'Ajiaco Santafereño',
      slug: 'ajiaco-santafereno',
      shortDescription: 'Sopa tradicional bogotana.',
      description:
        'Ajiaco servido con pollo, mazorca, papa criolla, alcaparras y crema de leche.',
      ingredients: 'Pollo, papa criolla, mazorca, alcaparras, crema de leche',
      price: 24000,
      imageUrl: 'https://placehold.co/600x400?text=Ajiaco',
    },
    {
      name: 'Sancocho Trifásico',
      slug: 'sancocho-trifasico',
      shortDescription: 'Sabor casero en cada cucharada.',
      description:
        'Sancocho con pollo, res y cerdo, acompañado de yuca, papa y plátano.',
      ingredients: 'Pollo, res, cerdo, yuca, papa, plátano, mazorca',
      price: 26000,
      imageUrl: 'https://placehold.co/600x400?text=Sancocho',
    },
    {
      name: 'Empanadas Colombianas',
      slug: 'empanadas-colombianas',
      shortDescription: 'Crujientes y recién hechas.',
      description:
        'Empanadas de maíz con relleno de papa y carne, servidas con ají casero.',
      ingredients: 'Masa de maíz, papa, carne, ají',
      price: 12000,
      imageUrl: 'https://placehold.co/600x400?text=Empanadas',
    },
    {
      name: 'Arepa Rellena',
      slug: 'arepa-rellena',
      shortDescription: 'Arepa con queso y carnes.',
      description:
        'Arepa dorada rellena de queso, pollo desmechado y salsa de la casa.',
      ingredients: 'Arepa, queso, pollo, salsa de la casa',
      price: 13500,
      imageUrl: 'https://placehold.co/600x400?text=Arepa+Rellena',
    },
    {
      name: 'Tamal Colombiano',
      slug: 'tamal-colombiano',
      shortDescription: 'Desayuno tradicional completo.',
      description:
        'Tamal envuelto en hoja de plátano con arroz, pollo, cerdo y verduras.',
      ingredients: 'Masa de maíz, arroz, pollo, cerdo, verduras',
      price: 16000,
      imageUrl: 'https://placehold.co/600x400?text=Tamal',
    },
    {
      name: 'Mote de Queso',
      slug: 'mote-de-queso',
      shortDescription: 'Receta costeña tradicional.',
      description:
        'Sopa cremosa de ñame con queso costeño y acompañamiento de arroz blanco.',
      ingredients: 'Ñame, queso costeño, ajo, cebolla, arroz',
      price: 18000,
      imageUrl: 'https://placehold.co/600x400?text=Mote+de+Queso',
    },
    {
      name: 'Posta Cartagenera',
      slug: 'posta-cartagenera',
      shortDescription: 'Carne en salsa dulce y especiada.',
      description:
        'Posta cartagenera en salsa de panela y especias, servida con arroz con coco.',
      ingredients: 'Carne de res, panela, especias, arroz con coco',
      price: 31000,
      imageUrl: 'https://placehold.co/600x400?text=Posta+Cartagenera',
    },
    {
      name: 'Arepa de Choclo',
      slug: 'arepa-de-choclo',
      shortDescription: 'Dulce, suave y con queso.',
      description:
        'Arepa de choclo recién asada con queso derretido y mantequilla.',
      ingredients: 'Maíz tierno, queso, mantequilla',
      price: 10000,
      imageUrl: 'https://placehold.co/600x400?text=Arepa+de+Choclo',
    },
    {
      name: 'Postre de Natas',
      slug: 'postre-de-natas',
      shortDescription: 'Clásico colombiano de cierre.',
      description:
        'Postre de natas tradicional con canela y textura suave.',
      ingredients: 'Leche, azúcar, canela',
      price: 9000,
      imageUrl: 'https://placehold.co/600x400?text=Postre+de+Natas',
    },
  ]

  for (let index = 0; index < colombianProducts.length; index += 1) {
    const productData = colombianProducts[index]

    const existingProduct = await prisma.product.findFirst({
      where: {
        businessId: colombianBusiness.id,
        slug: productData.slug,
      },
    })

    if (!existingProduct) {
      await prisma.product.create({
        data: {
          businessId: colombianBusiness.id,
          categoryId: colombianCategory.id,
          name: productData.name,
          slug: productData.slug,
          shortDescription: productData.shortDescription,
          description: productData.description,
          ingredients: productData.ingredients,
          price: productData.price,
          currency: 'COP',
          imageUrl: productData.imageUrl,
          isFeatured: index < 3,
          isActive: true,
          sortOrder: index + 1,
        },
      })
    }
  }

  const colombianPrimaryMedia = await prisma.mediaAsset.findFirst({
    where: {
      businessId: colombianBusiness.id,
      isPrimary: true,
    },
  })

  if (!colombianPrimaryMedia) {
    await prisma.mediaAsset.create({
      data: {
        businessId: colombianBusiness.id,
        type: MediaType.IMAGE,
        url: 'https://placehold.co/800x600?text=Sabores+de+Colombia',
        thumbnailUrl: 'https://placehold.co/400x300?text=Sabores+de+Colombia',
        altText: 'Portada Sabores de Colombia',
        title: 'Portada principal',
        caption: 'Imagen principal del restaurante',
        isPrimary: true,
        sortOrder: 1,
      },
    })
  }

  // 13. Evento inicial opcional
  await prisma.interactionEvent.create({
    data: {
      userId: user.id,
      businessId: business.id,
      eventType: EventType.BUSINESS_PROFILE_VIEW,
      sourceScreen: 'seed',
      sessionId: 'seed-session',
      metadata: {
        seeded: true,
      },
    },
  })

  console.log('Seed creada correctamente.', {
    burgerLabBusinessId: business.id,
    heladeriaAuroraBusinessId: iceCreamBusiness.id,
    heladeriaAuroraAdminEmail: iceCreamAdmin.email,
  })
}

main()
  .catch((e) => {
    console.error('Error ejecutando seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
