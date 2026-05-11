export default function StructuredData() {
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Taller Introductorio de IA para Emprendedoras',
    description:
      'Aprende a usar Inteligencia Artificial para tu negocio. Taller gratuito de 45 minutos diseñado para mujeres emprendedoras en Latinoamérica.',
    provider: {
      '@type': 'Organization',
      name: 'MujerTech',
      url: 'https://mujertech.org',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    courseMode: 'online',
    educationalLevel: 'beginner',
    inLanguage: 'es',
    isAccessibleForFree: true,
    audience: {
      '@type': 'Audience',
      audienceType: 'Mujeres emprendedoras en Latinoamérica',
    },
    teaches: [
      'Fundamentos de Inteligencia Artificial',
      'Cómo usar ChatGPT para negocios',
      'Creación de imágenes con IA',
      'Uso ético de la IA',
    ],
    timeRequired: 'PT45M',
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MujerTech',
    url: 'https://mujertech.org',
    logo: 'https://intro.mujertech.org/images/logomujertech1.png',
    description:
      'Empoderando a mujeres emprendedoras en Latinoamérica con tecnología e Inteligencia Artificial.',
    sameAs: [
      'https://www.instagram.com/mujertech',
      'https://www.facebook.com/mujertech',
      'https://twitter.com/mujertech',
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Taller Gratuito de IA para Emprendedoras',
    description: 'Aprende a usar ChatGPT y Canva para tu negocio en solo 45 minutos.',
    url: 'https://intro.mujertech.org',
    inLanguage: 'es',
    isPartOf: {
      '@type': 'WebSite',
      name: 'MujerTech',
      url: 'https://mujertech.org',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}
