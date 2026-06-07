const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("Iniciant buidatge de la base de dades...");
  await prisma.comment.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.statement.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creant usuaris de prova...");
  
  const adminPasswordHash = hashPassword("adminpassword");
  const studentPasswordHash = hashPassword("studentpassword");
  const pendingPasswordHash = hashPassword("pendingpassword");

  const admin = await prisma.user.create({
    data: {
      email: "admin@saas.com",
      name: "Professor Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "VALIDATED",
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@saas.com",
      name: "Alumne Validat",
      passwordHash: studentPasswordHash,
      role: "STUDENT",
      status: "VALIDATED",
    },
  });

  const pending = await prisma.user.create({
    data: {
      email: "pending@saas.com",
      name: "Alumne Pendent",
      passwordHash: pendingPasswordHash,
      role: "STUDENT",
      status: "PENDING",
    },
  });

  console.log("Usuaris creats:", {
    admin: admin.email,
    student: student.email,
    pending: pending.email,
  });

  console.log("Creant enunciats del catàleg obligatori...");

  const statementsData = [
    // M0612 - Desenvolupament Web Client
    {
      title: "IA1 - Kates ES6 (Bloc A)",
      description: "Exercicis de lògica JS (calculadora, daus, qüestionaris i incidències). Inclou la resolució de 5 exercicis bàsics utilitzant característiques modernes d'ES6.",
      ia: "IA1",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA2 - Kates ES6 (Bloc B)",
      description: "Continuació de kates ES6 per reforçar sintaxi, funcions, programació funcional i resolució de problemes complexos.",
      ia: "IA2",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA3 - Examen UF1 - Model A",
      description: "Examen teòric/pràctic per avaluar els coneixements de la Unitat Formativa 1 (fonaments de Javascript i DOM).",
      ia: "IA3",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA4 - Projecte 'vanilla' (mini-app)",
      description: "Mini-aplicació o joc desenvolupat completament en JavaScript 'vanilla' (sense frameworks) estructurat en sprints de desenvolupament.",
      ia: "IA4",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA5 - Examen Conceptes (arquitectures client)",
      description: "Examen teòric sobre models d'arquitectura web en client, SPA contra MPA, renderitzat i cicle de vida.",
      ia: "IA5",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA6 - Kates React (events/forms)",
      description: "Pràctiques fonamentals de React per treballar amb esdeveniments, formularis controlats, hooks (useState, useEffect, useContext) i useReducer.",
      ia: "IA6",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA7 - Kates d'asincronia i xarxa",
      description: "Exercicis per dominar la comunicació de xarxa amb fetch/axios, gestió de promeses, control d'errors i mesura de temps de resposta.",
      ia: "IA7",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA8 - Projecte React",
      description: "Aplicació React completa per a la gestió d'alumnes amb operacions CRUD i sistema d'autenticació de mockup.",
      ia: "IA8",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA9 - Examen pràctic React + API REST",
      description: "Examen pràctic en temps limitat connectant una aplicació React amb un backend JSON Server simulat.",
      ia: "IA9",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA9B - Examen pràctic React + API - Gestió de Pedidos",
      description: "Projecte pràctic de React i integració amb base de dades per crear un gestor de comandes i estat d'enviaments.",
      ia: "IA9B",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA9C - Examen pràctic React + API - Receptes per usuari",
      description: "Aplicació React per cercar, desar i modificar receptes de cuina filtrades per cada usuari de la sessió.",
      ia: "IA9C",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "P1 - Fitxa Projecte P1 - Aplicació 'Vanilla' ES6",
      description: "Projecte global de mòdul implementat sense llibreries externes, potenciant l'estructura MVC i el JS pur.",
      ia: "Projecte",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "P2 - Fitxa Projecte P2 - SPA en React",
      description: "Desenvolupament d'una Single Page Application robusta utilitzant React Router per al client web.",
      ia: "Projecte",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "P3 - Fitxa Projecte P3 - React + API",
      description: "Integració completa de front-end React amb endpoints reals d'una API externa d'estadístiques o dades.",
      ia: "Projecte",
      module: "M0612",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format&fit=crop&q=60",
    },

    // M0613 - Desenvolupament Web Servidor
    {
      title: "IA1 - Examen Conceptes (arquitectures servidor)",
      description: "Examen teòric del funcionament d'un servidor HTTP, middlewares, rutes, bases de dades relacionals i no relacionals.",
      ia: "IA1",
      module: "M0613",
      imageUrl: "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA2 - Kates API REST",
      description: "Seqüència EJ1-EJ6 (+EJ4B): Express, MongoDB, autenticació JWT, gestió de rols, testos unitaris i múltiples col·leccions.",
      ia: "IA2",
      module: "M0613",
      imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA3 - Projecte API",
      description: "Projecte backend de servidor amb autenticació, rols, pujada de fitxers, gestió de comandes i integració de pagaments.",
      ia: "IA3",
      module: "M0613",
      imageUrl: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA4 - Examen API REST",
      description: "Desenvolupament ràpid d'una API REST Express documentada amb Swagger i provada amb Supertest.",
      ia: "IA4",
      module: "M0613",
      imageUrl: "https://images.unsplash.com/photo-1599507593499-a3f7d7d97667?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA5 - Kates Next",
      description: "Pràctiques Next: multipàgina amb App Router, endpoints de l'API interna de Next, Server Actions i integració de components híbrids.",
      ia: "IA5",
      module: "M0613",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA6 - Projecte Next amb IA (MVC amb CRUD i auth)",
      description: "Disseny i muntatge d'un projecte Next.js complet amb assistència d'Intel·ligència Artificial centrat en CRUD de dades i autenticació.",
      ia: "IA6",
      module: "M0613",
      imageUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA7 - Kates Serveis web",
      description: "Consum de web services, serveis de tercers (correu, emmagatzematge de fitxers) i ús de webhooks.",
      ia: "IA7",
      module: "M0613",
      imageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA8 - Projecte SAAS",
      description: "Disseny i implementació d'una plataforma col·laborativa SaaS de lliuraments de projectes del curs amb base de dades persistida.",
      ia: "IA8",
      module: "M0613",
      imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA9 - Examen final",
      description: "Examen final pràctic del bloc de servidor integrant Next.js, bases de dades i publicació en línia.",
      ia: "IA9",
      module: "M0613",
      imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
    },

    // M0615 - Disseny d'interfícies web
    {
      title: "IA1 - Examen 1 - Conceptes generals",
      description: "Examen teòric sobre accessibilitat, usabilitat, usuaris objectiu, paletes cromàtiques i mockup d'interfícies.",
      ia: "IA1",
      module: "M0615",
      imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA2 - Projecte 1 - Interfície responsive amb multimèdia",
      description: "Maquetació responsive d'una interfície de plataforma de contingut audiovisual amb suport de multimèdia html5 pur.",
      ia: "IA2",
      module: "M0615",
      imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA3 - Examen 2 - Multimèdia i integració",
      description: "Exercici pràctic de flexbox i css grid, embedding de vídeos de YouTube/Vimeo i mapes interactius.",
      ia: "IA3",
      module: "M0615",
      imageUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA4 - Examen 3 - Llicencies i formats multimèdia",
      description: "Preguntes i respostes sobre llicències Creative Commons, dret de còpia digital i comparatives de formats d'àudio i vídeo compressius.",
      ia: "IA4",
      module: "M0615",
      imageUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA5 - Projecte 2 - Tailwind i components",
      description: "Construcció d'una interfície multi-secció en 9 passos utilitzant exclusivament Tailwind CSS i disseny basat en components.",
      ia: "IA5",
      module: "M0615",
      imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA6 - Examen 4 - Tailwind i llibreries",
      description: "Prova pràctica dissenyant elements dinàmics usant Tailwind CSS combinat amb llibreries d'animacions.",
      ia: "IA6",
      module: "M0615",
      imageUrl: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA7 - Projecte 3 - Disseny amb Bootstrap accessible",
      description: "Creació d'un portal web basat en Bootstrap 5 que compleixi amb les directrius d'accessibilitat W3C WCAG AA.",
      ia: "IA7",
      module: "M0615",
      imageUrl: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "IA8 - Projecte 4 - Portfolio personal i usable",
      description: "Disseny i lliurament del portafoli de projectes de l'alumne enfocat a la usabilitat, marca personal i cerca de feina.",
      ia: "IA8",
      module: "M0615",
      imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=500&auto=format&fit=crop&q=60",
    },
    {
      title: "P1 - Projectes - Resum",
      description: "Recopilació i autoavaluació de tots els projectes realitzats en el mòdul de disseny d'interfícies web.",
      ia: "Projecte",
      module: "M0615",
      imageUrl: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=500&auto=format&fit=crop&q=60",
    }
  ];

  for (const st of statementsData) {
    await prisma.statement.create({
      data: st,
    });
  }

  console.log(`Creats ${statementsData.length} enunciats correctament.`);
  console.log("Llavor (seed) completada amb èxit!");
}

main()
  .catch((e) => {
    console.error("Error durant l'execució del seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
