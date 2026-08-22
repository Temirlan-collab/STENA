const savedProducts=(
  JSON.parse(
    localStorage.getItem('stenaSettings')||'null'
  )||{products:[]}
).products||[];

document
  .querySelectorAll('.products .product-art')
  .forEach((card,index)=>{
    const photo=
      savedProducts[index]?.[4];

    if(photo){
      card.style.backgroundImage=
        `url("${photo}")`;

      card.style.backgroundSize=
        'cover';

      card.style.backgroundPosition=
        'center';
    }
  });