const faces = ["./assets/img/tadek/happy.png",
         "./assets/img/tadek/sad.png",
         "./assets/img/tadek/mad.png",
         "./assets/img/tadek/disappointed.png"];
const lines = [
    {
        "text": "Do dzieła! Pozbądźmy się tej elektrowni!",
        "face": faces[2],
        "next": -1
    },
    {
        "text": "Witaj przyjacielu!",
        "face": faces[0],
        "next": 2
    },
    {
        "text": "Nasze miasto jest w niebezpieczeństwie, zostało przejęte przez zanieczyszczenia i węgiel!",
        "face": faces[1],
        "next": 3
    },
    {
        "text": "Musimy przerzucić się na energie odnawialne zanim będzie za późno i zniszczyć elektrownię węglową!",
        "face": faces[2],
        "next": 4
    },
    {
        "text": "Ulepszaj budynki montując na nich panele fotowoltaiczne i buduj elektrownie wiatrowe, oraz słoneczne!",
        "face": faces[0],
        "next": 5
    },
    {
        "text": "Pamiętaj, że nadwyżki prądu wypada przechowywać w bankach!",
        "face": faces[0],
        "next": 6
    },
    {
        "text": "Uważaj, żeby nie zbankrutować, ani nie dopuścić do problemów z energią.",
        "face": faces[3],
        "next": 7
    },
    {
        "text": "A finalnie, gdy infrastruktura będzie gotowa, zniszcz elektrownię węglową! Nie będzie już potrzebna!",
        "face": faces[2],
        "next": 0
    },
    {
        "text": "Jeeeeej! Miasto wreszcie jest czyste i zielone! Dziękuję Ci za pomoc!",
        "face": faces[0],
        "next": -1
    },
    {
        "text": "O nie, problemy z prądem doprowadziły do zamieszek w mieście... Nasza misja zawiodła...",
        "face": faces[3],
        "next": -1
    },
    
]


let currentLineIndex = null;

function showTadekDialog(startIndex = 0) {
  currentLineIndex = startIndex;
  const dialog = document.getElementById("tadek-dialog");
  dialog.classList.remove("animate-slide-out");
  dialog.style.display = "flex";

  // Restart animation
  void dialog.offsetWidth;
  dialog.classList.add("animate-slide-in");

  updateTadekLine(lines[currentLineIndex]);
}

function updateTadekLine(line) {
  const textSpan = document.getElementById("tadek-text");
  const faceImg = document.getElementById("tadek-face");



    textSpan.innerText = line.text;
    faceImg.src = line.face;
    
}

function hideTadekDialog() {
  const dialog = document.getElementById("tadek-dialog");
  dialog.classList.remove("animate-slide-in");
  dialog.classList.add("animate-slide-out");

  setTimeout(() => {
    dialog.style.display = "none";
    currentLineIndex = null;
  }, 400);
}

function advanceTadekLine() {
  if (currentLineIndex === null) return;
  const current = lines[currentLineIndex];
  if (current.next === -1) {
    hideTadekDialog();
  } else {
    currentLineIndex = current.next;
    updateTadekLine(lines[currentLineIndex]);
  }
}

document.getElementById("tadek-next-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  advanceTadekLine();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    advanceTadekLine();
    e.preventDefault();
  }
});



function showTutorial(){
    
   const el = document.getElementById("landing-page");
  let username = document.getElementById("username").value.trim()
  if (username != "") {
    localStorage.setItem("username", username);
    el.style.display = "none";
    showTadekDialog(1);

  }else{
    alert("Nazwa użytkownika nie może być pusta!")
  }
}
