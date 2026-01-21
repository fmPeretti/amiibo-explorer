// Script to generate community templates with real amiibo data from AmiiboAPI
// Run with: node scripts/generate-templates.js

const fs = require('fs');
const path = require('path');

const AMIIBO_API_BASE = 'https://www.amiiboapi.org/api';

async function fetchAmiibos(filters = {}) {
  const params = new URLSearchParams(filters);
  const url = `${AMIIBO_API_BASE}/amiibo/?${params.toString()}`;
  console.log(`Fetching: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data.amiibo) ? data.amiibo : [data.amiibo];
}

function amiiboToItem(amiibo) {
  return {
    head: amiibo.head,
    tail: amiibo.tail,
    name: amiibo.name,
    image: amiibo.image,
    amiiboSeries: amiibo.amiiboSeries,
    gameSeries: amiibo.gameSeries,
  };
}

function createTemplate(id, name, description, author, items, options = {}) {
  return {
    id,
    name,
    description,
    author,
    templateType: options.templateType || "coin",
    pageSize: options.pageSize || "A4",
    diameter: options.diameter || 30,
    cardWidth: options.cardWidth || 54,
    cardHeight: options.cardHeight || 85,
    margin: options.margin || 5,
    spacing: options.spacing || 5,
    items: items.map(amiiboToItem),
  };
}

async function generateTemplates() {
  const templates = [];

  console.log('\n=== Generating Community Templates ===\n');

  // 1. Animal Crossing Cards - Popular villagers
  console.log('1. Fetching Animal Crossing cards...');
  try {
    const animalCrossing = await fetchAmiibos({ amiiboSeries: 'Animal Crossing' });
    const acCards = animalCrossing.filter(a => a.type === 'Card');

    // Popular villagers to look for
    const popularVillagers = ['Raymond', 'Marshal', 'Ankha', 'Fauna', 'Bob', 'Judy', 'Diana', 'Merengue', 'Maple', 'Stitches', 'Molly', 'Coco'];
    const selectedCards = [];

    for (const name of popularVillagers) {
      const found = acCards.find(a => a.name === name);
      if (found) {
        selectedCards.push(found);
        console.log(`      Found card: ${found.name}`);
      }
    }

    // If we don't have enough, fill with Tom Nook, Isabelle, K.K. Slider etc
    const specialNPCs = ['Tom Nook', 'Isabelle', 'K.K. Slider', 'Blathers', 'Celeste', 'Kicks'];
    for (const name of specialNPCs) {
      if (selectedCards.length >= 12) break;
      const found = acCards.find(a => a.name === name);
      if (found && !selectedCards.some(c => c.head === found.head && c.tail === found.tail)) {
        selectedCards.push(found);
        console.log(`      Found NPC: ${found.name}`);
      }
    }

    if (selectedCards.length > 0) {
      templates.push(createTemplate(
        'community-ac-cards',
        'Animal Crossing Card Collection',
        'Popular Animal Crossing villager cards - perfect for card-sized prints!',
        'Amiibo Explorer',
        selectedCards,
        { templateType: 'card', cardWidth: 54, cardHeight: 85 }
      ));
      console.log(`   Added ${selectedCards.length} Animal Crossing cards`);
    }
  } catch (e) {
    console.log('   Failed to fetch Animal Crossing:', e.message);
  }

  // 2. Animal Crossing Figures
  console.log('2. Fetching Animal Crossing figures...');
  try {
    const animalCrossing = await fetchAmiibos({ amiiboSeries: 'Animal Crossing' });
    const acFigures = animalCrossing.filter(a => a.type === 'Figure').slice(0, 8);

    if (acFigures.length > 0) {
      templates.push(createTemplate(
        'community-ac-figures',
        'Animal Crossing Figures',
        'The main Animal Crossing amiibo figures collection',
        'Amiibo Explorer',
        acFigures,
        { templateType: 'coin', diameter: 30 }
      ));
      console.log(`   Added ${acFigures.length} Animal Crossing figures`);
    }
  } catch (e) {
    console.log('   Failed to fetch AC figures:', e.message);
  }

  // 3. Super Mario Collection
  console.log('3. Fetching Super Mario amiibos...');
  try {
    const mario = await fetchAmiibos({ amiiboSeries: 'Super Mario Bros.' });
    const marioFigures = mario.filter(a => a.type === 'Figure').slice(0, 10);

    if (marioFigures.length > 0) {
      templates.push(createTemplate(
        'community-mario-collection',
        'Super Mario Collection',
        'Classic Super Mario Bros. amiibo figures - Mario, Luigi, Peach, and friends!',
        'Amiibo Explorer',
        marioFigures,
        { templateType: 'coin', diameter: 30 }
      ));
      console.log(`   Added ${marioFigures.length} Mario figures`);
    }
  } catch (e) {
    console.log('   Failed to fetch Mario:', e.message);
  }

  // 4. Nintendo Favorites - Mixed iconic characters from Smash Bros
  console.log('4. Fetching Nintendo favorites from Smash Bros...');
  try {
    const smash = await fetchAmiibos({ amiiboSeries: 'Super Smash Bros.' });

    // Pick iconic Nintendo characters - exact name match only
    const iconicNames = ['Mario', 'Link', 'Samus', 'Pikachu', 'Kirby', 'Donkey Kong', 'Fox', 'Yoshi', 'Zelda', 'Peach', 'Luigi', 'Captain Falcon'];
    const favorites = [];

    for (const name of iconicNames) {
      // Exact name match to avoid Dr. Mario, Toon Link, etc.
      const found = smash.find(a => a.name === name);
      if (found && !favorites.some(f => f.head === found.head && f.tail === found.tail)) {
        favorites.push(found);
        console.log(`      Found: ${found.name}`);
      } else if (!found) {
        console.log(`      Not found exact: ${name}`);
      }
    }

    if (favorites.length > 0) {
      templates.push(createTemplate(
        'community-nintendo-favorites',
        'Nintendo All-Stars',
        'Iconic Nintendo characters from across the gaming universe - the ultimate collection!',
        'Amiibo Explorer',
        favorites,
        { templateType: 'coin', diameter: 30 }
      ));
      console.log(`   Added ${favorites.length} Nintendo favorites`);
    }
  } catch (e) {
    console.log('   Failed to fetch Smash Bros:', e.message);
  }

  // 5. Legend of Zelda Collection
  console.log('5. Fetching Legend of Zelda amiibos...');
  try {
    const zelda = await fetchAmiibos({ amiiboSeries: 'Legend Of Zelda' });
    const zeldaFigures = zelda.filter(a => a.type === 'Figure').slice(0, 10);

    if (zeldaFigures.length > 0) {
      templates.push(createTemplate(
        'community-zelda-collection',
        'Legend of Zelda Collection',
        'Heroes and champions from across Hyrule - Link, Zelda, and more!',
        'Amiibo Explorer',
        zeldaFigures,
        { templateType: 'coin', diameter: 30 }
      ));
      console.log(`   Added ${zeldaFigures.length} Zelda figures`);
    }
  } catch (e) {
    console.log('   Failed to fetch Zelda:', e.message);
  }

  // Save templates
  const outputDir = path.join(__dirname, '..', 'public', 'templates');

  // Ensure directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save index
  const index = templates.map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    author: t.author,
    templateType: t.templateType,
    itemCount: t.items.length,
  }));

  fs.writeFileSync(
    path.join(outputDir, 'index.json'),
    JSON.stringify(index, null, 2)
  );
  console.log(`\nSaved index.json with ${templates.length} templates`);

  // Save individual templates
  for (const template of templates) {
    const filename = `${template.id}.json`;
    fs.writeFileSync(
      path.join(outputDir, filename),
      JSON.stringify(template, null, 2)
    );
    console.log(`Saved ${filename}`);
  }

  console.log('\n=== Done! ===\n');
}

generateTemplates().catch(console.error);
