import { mkdir, writeFile } from 'node:fs/promises';

const assets = [
  {
    url: 'https://www.massgeneral.org/assets/MGH/images/surgery/thoracic-surgery/chi-fu-jeffrey-yang-300x300.jpg',
    path: 'public/research/chi-fu-jeffrey-yang.jpg',
  },
  {
    url: 'https://static.wixstatic.com/media/dd27d0_8780d2ea35e348a09a8e6669e338f3da~mv2.png/v1/fill/w_518,h_554,al_c,lg_1,q_85,enc_avif,quality_auto/ALCSI-logo-lungs.png',
    path: 'public/community/alcsi-logo.png',
  },
  {
    url: 'https://static.wixstatic.com/media/666657_81203b5e323745bcbfa903ac17fa50fe~mv2.jpg/v1/fill/w_906,h_634,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/IMG_6869_JPG.jpg',
    path: 'public/community/alcsi-outreach.jpeg',
  },
];

await mkdir('public/research', { recursive: true });
await mkdir('public/community', { recursive: true });

await Promise.all(
  assets.map(async (asset) => {
    const response = await fetch(asset.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${asset.url}: ${response.status}`);
    }
    await writeFile(asset.path, Buffer.from(await response.arrayBuffer()));
  })
);
