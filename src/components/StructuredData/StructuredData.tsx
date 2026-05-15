const SITE_URL = 'https://bootcamp.mujertech.org';
const ORG_ID = `${SITE_URL}/#organization`;
const PROGRAM_ID = `${SITE_URL}/es#program`;

const organizationSchema = {
  '@type': 'EducationalOrganization',
  '@id': ORG_ID,
  name: 'MujerTech',
  url: 'https://mujertech.org',
  logo: `${SITE_URL}/images/logomujertech1.png`,
  description:
    'Empoderando a mujeres emprendedoras en Latinoamérica con tecnología e Inteligencia Artificial.',
  sameAs: [
    'https://www.instagram.com/mujertechorg/',
    'https://www.facebook.com/profile.php?id=61585640930244',
  ],
};

const freeOffer = {
  '@type': 'Offer',
  price: '0',
  priceCurrency: 'USD',
  category: 'Free',
  availability: 'https://schema.org/InStock',
};

const courseDefaults = {
  '@type': 'Course',
  provider: { '@id': ORG_ID },
  inLanguage: 'es',
  isAccessibleForFree: true,
  educationalLevel: 'beginner',
  learningResourceType: 'online course',
  courseMode: 'online',
  offers: freeOffer,
};

const courses = [
  {
    ...courseDefaults,
    name: '¿Qué es la Inteligencia Artificial?',
    description:
      'Introducción práctica a la Inteligencia Artificial para mujeres emprendedoras: qué es la IA, qué puede hacer y qué no puede hacer en el contexto de un negocio pequeño.',
    timeRequired: 'PT10M',
    teaches: [
      'Qué es la Inteligencia Artificial',
      'Qué puede y qué no puede hacer la IA',
      'Uso ético y crítico de la IA en un negocio',
    ],
  },
  {
    ...courseDefaults,
    name: 'Cómo hablarle a la IA',
    description:
      'Aprende a escribir mensajes claros a la IA (prompts) y conoce las herramientas gratuitas más accesibles para emprendedoras: ChatGPT y Canva.',
    timeRequired: 'PT15M',
    teaches: [
      'Estructura de un buen prompt',
      'Uso básico de ChatGPT',
      'Uso básico de Canva',
    ],
  },
  {
    ...courseDefaults,
    name: 'Marketing práctico con IA',
    description:
      'Crea una pieza de marketing real para tu negocio en una sola sesión: elige una meta concreta, arma un prompt con el método CTO, y produce contenido publicable hoy.',
    timeRequired: 'PT20M',
    teaches: [
      'Definir una meta de marketing concreta',
      'Método CTO para escribir prompts de marketing',
      'Revisar y editar respuestas de IA con criterio propio',
    ],
  },
];

const programSchema = {
  '@type': 'EducationalProgram',
  '@id': PROGRAM_ID,
  name: 'Bootcamp de IA para emprendedoras MujerTech',
  description:
    'Bootcamp gratuito en español que enseña a mujeres emprendedoras de Latinoamérica y Estados Unidos a usar la Inteligencia Artificial en su negocio. Tres módulos prácticos de 10 a 20 minutos cada uno, sobre fundamentos de IA, escritura de prompts, y marketing con IA.',
  url: `${SITE_URL}/es`,
  inLanguage: 'es',
  isAccessibleForFree: true,
  educationalLevel: 'beginner',
  provider: { '@id': ORG_ID },
  audience: {
    '@type': 'EducationalAudience',
    educationalRole: 'student',
    audienceType: 'Mujeres emprendedoras hispanohablantes',
    geographicArea: [
      { '@type': 'Place', name: 'Latin America' },
      { '@type': 'Country', name: 'United States' },
    ],
  },
  offers: freeOffer,
  hasCourse: courses,
};

const graph = {
  '@context': 'https://schema.org',
  '@graph': [organizationSchema, programSchema],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
