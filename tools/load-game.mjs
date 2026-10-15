import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Phần tử DOM giả: nhận mọi thuộc tính/lời gọi, không làm gì.
function stub(){
  return new Proxy(function(){}, {
    get(t, k){
      if (k === Symbol.toPrimitive) return () => "";
      if (k === Symbol.iterator) return function*(){};
      if (k === "hidden") return false;
      if (k === "length") return 0;
      return stub();
    },
    set(){ return true; },
    apply(){ return stub(); },
  });
}

const OPT = ["fbPage","shopItems","pin","confront","showsCoach","partLabel","accuse","nextCh","chapterListHTML","dockApps","pwNorm","tryUnlock","tryRestore"];

export function loadGame(){
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const src = html.split("<script>")[1].split("</script>")[0];
  const ctx = vm.createContext({
    document: stub(),
    localStorage: {getItem: () => null, setItem(){}},
    setTimeout: () => 0, clearTimeout(){}, innerWidth: 1280, console,
  });
  const opt = OPT.map(n => `${n}: typeof ${n}==="function" ? ${n} : null`).join(",");
  return vm.runInContext(`${src}
;({CHAPTERS, R, S, done, norm, freshState,
  setCh(i){ CH = CHAPTERS[i]; freshState(i); },
  get CH(){ return CH; }, ${opt}})`, ctx);
}
