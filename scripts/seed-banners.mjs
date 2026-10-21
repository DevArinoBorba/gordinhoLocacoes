import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://locacoes:locacoes123@localhost:20000/locacoes',
});

async function main() {
  await pool.query('DELETE FROM banners');

  await pool.query(`
    INSERT INTO banners (id, eyebrow, title, subtitle, link_url, link_text, image_filename, badge_text, sort_order, active)
    VALUES 
    (
      'a1111111-1111-4111-a111-111111111111',
      'NOVIDADES NO CATÁLOGO',
      'ÁUDIO & SOM PARA SEU EVENTO',
      'Caixas amplificadas com tripé, microfones de estúdio e kits sem fio profissionais para locação imediata.',
      '/?categoria=%C3%81udio%20e%20v%C3%ADdeo#equipamentos',
      'CONFERIR EQUIPAMENTOS DE SOM',
      '05a48b60-1402-42af-bf4b-8bb30849f3d2.webp',
      E'EVENTOS &\\nPRODUÇÃO\\nTOP!',
      1,
      true
    ),
    (
      'a2222222-2222-4222-a222-222222222222',
      'LINHA PROFISSIONAL',
      'FERRAMENTAS PARA SUA OBRA',
      'Kit furadeira e parafusadeira a bateria, esmerilhadeiras e politrizes prontas para o seu trabalho render mais.',
      '/?categoria=Ferramentas#equipamentos',
      'VER FERRAMENTAS DISPONÍVEIS',
      'e0596ab3-18d6-45fd-9c79-fd145656f589.webp',
      E'OBRA COM\\nALTA\\nFORÇA!',
      2,
      true
    )
  `);

  const res = await pool.query('SELECT id, title, eyebrow, image_filename, active FROM banners ORDER BY sort_order ASC');
  console.log('Successfully seeded banners:', res.rows);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
