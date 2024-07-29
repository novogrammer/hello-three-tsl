import './style.scss'


const linkList:string[]=[
  "kaleidoscope.html",
  "webgpu_compute_points.html",
]

const appElement=document.querySelector<HTMLDivElement>('#app');

if(!appElement){
  throw new Error("appElement is null");
}

for(let link of linkList){
  const paragraphElement=document.createElement("p");
  appElement.appendChild(paragraphElement);
  const linkElement=document.createElement("a");
  linkElement.href=`./${link}`;
  linkElement.textContent=link;
  paragraphElement.appendChild(linkElement);


}


