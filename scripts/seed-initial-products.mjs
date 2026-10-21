import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import pg from 'pg';

process.loadEnvFile('.env');
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada no .env');
}

const uploadsDir = resolve(process.env.UPLOADS_DIR || '.local/uploads');
await mkdir(uploadsDir, { recursive: true });

const products = [
  {
    imageFile: 'balcao pdv.jpeg',
    name: 'Balcão Promocional PDV Desmontável',
    category: 'Eventos e divulgação',
    description: 'Balcão promocional portátil e desmontável para ponto de venda (PDV), feiras, eventos e ações de marketing. Estrutura leve, fácil de montar e transportar.',
    ideal_for: 'Demonstração de produtos, recepção em eventos, estandes, feiras promocionais e degustação em pontos de venda.',
    included_items: 'Balcão desmontável com tampo\nPrateleira interna\nHaste e testeira superior\nBolsa de transporte',
    daily_rate: 80.00,
    min_days: 1,
    deposit_amount: 250.00,
    codePrefix: 'PDV',
    quantity: 2,
  },
  {
    imageFile: 'bastao de selfie com tripe.jpeg',
    name: 'Bastão de Selfie com Tripé e Bluetooth',
    category: 'Suportes e acessórios',
    description: 'Bastão de selfie multifuncional retrátil com tripé integrado e controle remoto disparador Bluetooth. Compatível com smartphones Android e iOS.',
    ideal_for: 'Gravações para redes sociais, lives, criação de conteúdo, viagens e fotos em grupo.',
    included_items: 'Bastão telescópico com tripé embutido\nControle remoto disparador Bluetooth destacável\nSuporte ajustável para smartphone',
    daily_rate: 20.00,
    min_days: 1,
    deposit_amount: 80.00,
    codePrefix: 'SEL',
    quantity: 3,
  },
  {
    imageFile: 'cabohdmi30metros.jpeg',
    name: 'Cabo HDMI 30 Metros de Alta Velocidade',
    category: 'Áudio e vídeo',
    description: 'Cabo HDMI de 30 metros de extensão com amplificador de sinal integrado, suportando resolução Full HD e 4K sem perda de qualidade ou interferência.',
    ideal_for: 'Transmissão de vídeo em eventos, igrejas, auditórios, telões, projetores e palcos distantes da central de controle.',
    included_items: 'Cabo HDMI 30m de alta velocidade\nCarretel/organizador de cabo com protetores nos conectores',
    daily_rate: 35.00,
    min_days: 1,
    deposit_amount: 120.00,
    codePrefix: 'HDM',
    quantity: 2,
  },
  {
    imageFile: 'caixa de som com tripe.jpeg',
    name: 'Caixa de Som Amplificada com Tripé Pedestal',
    category: 'Áudio e vídeo',
    description: 'Caixa de som amplificada de alta potência com conectividade Bluetooth, entradas USB, cartão SD e microfone/instrumento, acompanhada de tripé pedestal ajustável.',
    ideal_for: 'Festas, palestras, confraternizações, pequenas apresentações musicais, cerimônias e som ambiente para eventos.',
    included_items: 'Caixa acústica amplificada\nPedestal tripé metálico regulável\nCabo de energia\nControle remoto',
    daily_rate: 120.00,
    min_days: 1,
    deposit_amount: 350.00,
    codePrefix: 'SOM',
    quantity: 2,
  },
  {
    imageFile: 'escada articulada.jpeg',
    name: 'Escada Articulada Multifuncional Telescópica',
    category: 'Estruturas e apoio',
    description: 'Escada articulada dobrável em alumínio reforçado com múltiplas posições de uso (reta, pintor/cavalete, plataforma ou andaime). Trava de segurança confiável e sapatas antiderrapantes.',
    ideal_for: 'Reformas, pintura, manutenção elétrica, instalações em geral, poda e trabalhos em alturas variadas.',
    included_items: 'Escada articulada em alumínio com sapatas de apoio antiderrapantes',
    daily_rate: 50.00,
    min_days: 1,
    deposit_amount: 200.00,
    codePrefix: 'ESC',
    quantity: 2,
  },
  {
    imageFile: 'esmerilhadeira.jpeg',
    name: 'Esmerilhadeira Angular Profissional',
    category: 'Ferramentas',
    description: 'Esmerilhadeira angular de alto rendimento para desbaste, corte de metais, alvenaria e lixamento. Empunhadura ergonômica auxiliar com capa de proteção regulável.',
    ideal_for: 'Corte de ferro, perfis metálicos, acabamento em soldas, desbaste de concreto e peças metálicas.',
    included_items: 'Esmerilhadeira angular\nCapa protetora de disco\nEmpunhadura lateral auxiliar\nChave de aperto de disco',
    daily_rate: 45.00,
    min_days: 1,
    deposit_amount: 150.00,
    codePrefix: 'ESM',
    quantity: 2,
  },
  {
    imageFile: 'kit furadeira e parafusadeira.jpeg',
    name: 'Kit Furadeira e Parafusadeira a Bateria',
    category: 'Ferramentas',
    description: 'Kit furadeira e parafusadeira de impacto sem fio, equipada com baterias recarregáveis de lítio, controle de torque, velocidade variável e maleta de acessórios completa.',
    ideal_for: 'Montagem de móveis, furações em madeira, metal e alvenaria, instalações residenciais e comerciais.',
    included_items: 'Furadeira/Parafusadeira a bateria\n2 Baterias de lítio recarregáveis\nCarregador bivolt rápido\nMaleta de transporte rígida com bits e brocas',
    daily_rate: 60.00,
    min_days: 1,
    deposit_amount: 200.00,
    codePrefix: 'FUR',
    quantity: 2,
  },
  {
    imageFile: 'microfone de lapela s fio.jpeg',
    name: 'Kit Microfone de Lapela Sem Fio',
    category: 'Áudio e vídeo',
    description: 'Sistema de microfones de lapela sem fio de captação limpa e redução de ruído, com receptor compatível com celulares, câmeras e computadores.',
    ideal_for: 'Gravação de entrevistas, vídeos para YouTube, Reels/TikTok, palestras, podcasts externos e transmissões ao vivo.',
    included_items: '2 Transmissores lapela sem fio com clipe\n1 Receptor sem fio (Type-C / Lightning / P2)\nCabo de carregamento\nEstojo compacto de transporte',
    daily_rate: 45.00,
    min_days: 1,
    deposit_amount: 150.00,
    codePrefix: 'LAP',
    quantity: 2,
  },
  {
    imageFile: 'microfone de studio.jpeg',
    name: 'Microfone Condensador de Estúdio Profissional',
    category: 'Áudio e vídeo',
    description: 'Microfone condensador de alta sensibilidade para captação vocal nítida e rica em detalhes, acompanhado de shock mount (aranha), pop filter e braço articulado de mesa.',
    ideal_for: 'Gravação de podcasts, locuções profissionais, streaming de games, home studio e produção de cursos.',
    included_items: 'Microfone condensador\nBraço articulado com suporte para mesa\nPop filter e espuma antirruído\nSuporte aranha (shock mount)\nCabo de áudio/USB',
    daily_rate: 55.00,
    min_days: 1,
    deposit_amount: 180.00,
    codePrefix: 'EST',
    quantity: 2,
  },
  {
    imageFile: 'microfone duplo com fio.jpeg',
    name: 'Kit Microfone Duplo com Fio Dinâmico',
    category: 'Áudio e vídeo',
    description: 'Par de microfones dinâmicos com fio de alta fidelidade e excelente rejeição a microfonias, ideais para fala e canto em eventos.',
    ideal_for: 'Apresentações, karaokê, reuniões corporativas, cultos e eventos com dois oradores ou cantores.',
    included_items: '2 Microfones dinâmicos com botão liga/desliga\n2 Cabos de áudio balanceados XLR/P10\nEstojo de acondicionamento',
    daily_rate: 40.00,
    min_days: 1,
    deposit_amount: 120.00,
    codePrefix: 'DUP',
    quantity: 2,
  },
  {
    imageFile: 'microfone sem fio.jpeg',
    name: 'Microfone Sem Fio Profissional UHF',
    category: 'Áudio e vídeo',
    description: 'Microfone dinâmico de mão sem fio com receptor de longo alcance em frequência UHF estável, livre de interferências e com som cristalino.',
    ideal_for: 'Mestres de cerimônia, palestrantes, eventos corporativos, igrejas e shows com liberdade total de movimento no palco.',
    included_items: 'Microfone bastão sem fio\nBase receptora com antena\nFonte de alimentação\nCabo P10 de conexão\nAnel antichoque',
    daily_rate: 50.00,
    min_days: 1,
    deposit_amount: 160.00,
    codePrefix: 'MSF',
    quantity: 2,
  },
  {
    imageFile: 'politriz orbital.jpeg',
    name: 'Politriz Roto-Orbital Automotiva',
    category: 'Ferramentas',
    description: 'Politriz roto-orbital elétrica com controle de velocidade variável para polimento e espelhamento automotivo sem criar hologramas ou queimar o verniz.',
    ideal_for: 'Polimento automotivo, detalhamento (estética automotiva), aplicação de ceras e revitalização de superfícies brilhantes.',
    included_items: 'Politriz roto-orbital\nPrato de suporte com velcro\nEmpunhadura ergonômica tipo D\nChave de fixação',
    daily_rate: 65.00,
    min_days: 1,
    deposit_amount: 220.00,
    codePrefix: 'POL',
    quantity: 2,
  },
  {
    imageFile: 'smartphone android.jpeg',
    name: 'Smartphone Android para Eventos e Produção',
    category: 'Eletrônicos e controle',
    description: 'Smartphone Android com tela ampla, conexão 4G/Wi-Fi, câmera de alta resolução e bateria de longa duração para operação de apps de controle, credenciamento ou produção.',
    ideal_for: 'Credenciamento de eventos, leitura de ingressos/QR codes, controle de mesas de som digital por app, monitoramento e ponto de venda móvel.',
    included_items: 'Aparelho smartphone Android desbloqueado\nCabo USB-C de carregamento\nCarregador rápido\nCapa de proteção e película já instalada',
    daily_rate: 45.00,
    min_days: 1,
    deposit_amount: 250.00,
    codePrefix: 'AND',
    quantity: 2,
  },
];

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query('BEGIN');

  console.log('1. Removendo reservas e dados de teste anteriores...');
  await client.query('DELETE FROM reservation_history');
  await client.query('DELETE FROM notification_outbox');
  await client.query('DELETE FROM reservations');
  await client.query('DELETE FROM units');
  await client.query('DELETE FROM equipment');
  console.log('✓ Dados de teste anteriores removidos com sucesso.');

  console.log('2. Processando imagens e cadastrando os 13 novos produtos...');
  let totalUnits = 0;

  for (const prod of products) {
    const srcPath = resolve('src/img', prod.imageFile);
    const fileBuffer = await readFile(srcPath);

    const webpBuffer = await sharp(fileBuffer, { limitInputPixels: 40000000 })
      .rotate()
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const photoFilename = `${randomUUID()}.webp`;
    await writeFile(join(uploadsDir, photoFilename), webpBuffer);

    const eqRes = await client.query(
      `INSERT INTO equipment (
        name, description, category, daily_rate, min_days, deposit_amount,
        photo_filename, ideal_for, included_items
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        prod.name,
        prod.description,
        prod.category,
        prod.daily_rate,
        prod.min_days,
        prod.deposit_amount,
        photoFilename,
        prod.ideal_for,
        prod.included_items,
      ]
    );

    const equipmentId = eqRes.rows[0].id;

    for (let i = 1; i <= prod.quantity; i++) {
      const code = `${prod.codePrefix}-${String(i).padStart(3, '0')}`;
      const serial = `${prod.codePrefix}-SN${Math.floor(100000 + Math.random() * 900000)}`;
      await client.query(
        `INSERT INTO units (equipment_id, code, serial, state)
         VALUES ($1, $2, $3, 'available')`,
        [equipmentId, code, serial]
      );
      totalUnits++;
    }

    console.log(`✓ Cadastrado: ${prod.name} (${prod.quantity} unidades, foto: ${photoFilename})`);
  }

  await client.query('COMMIT');
  console.log(`\nSucesso total! Cadastrados ${products.length} equipamentos e ${totalUnits} unidades disponíveis.`);
} catch (error) {
  await client.query('ROLLBACK');
  console.error('Erro durante o cadastro:', error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
