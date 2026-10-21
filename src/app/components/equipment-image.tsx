import Image from 'next/image';
import {ProductArt} from '../loja/product-art';
export function EquipmentImage({name,filename}:{name:string;filename?:string|null}) {
  return filename?<Image src={`/loja/imagens/${filename}`} alt={name} width={600} height={450} unoptimized style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>:<ProductArt name={name}/>;
}
