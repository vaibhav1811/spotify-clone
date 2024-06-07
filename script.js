

let songs;

let currentsong = new Audio();

function convertSecondsToMinutes(seconds) {
  if(isNaN(seconds)|| seconds<0){
    return"00:00";
  }
  // Calculate whole minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Pad single digit minutes and seconds with a leading zero
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(remainingSeconds).padStart(2, "0");

  // Return the formatted string
  return `${paddedMinutes}:${paddedSeconds}`;
}

async function getSongs() {
  let a = await fetch("http://127.0.0.1:5500/songs/");
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split("/songs/")[1]);
    }
  }

  return songs;
}

const playmusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentsong.src = "/songs/" + track;
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00.00/00.0";
};

async function main() {
  // get the list of all songs

   songs = await getSongs();
  playmusic(songs[0], true);
  console.log(songs);

  // show all the songs in the playlist

  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
        <img src="img/music.svg" alt="">
    <div class="info">
        <div>  ${song.replaceAll("%20", " ")}</div>
        <div>Vaibhav</div>
    </div>
    <div class="playnow">
        <span>play now</span>
        <img src="play.svg" alt="">
    </div>  </li>`;
  }

  //attach an event listener to each song

  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {

      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  // Attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "pause.svg";
    } else {
      currentsong.pause();
      play.src = "play.svg";
    }
  });

  //listen for timeupdate event

  currentsong.addEventListener("timeupdate", () => {
    console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(
      currentsong.currentTime
    )}/ ${convertSecondsToMinutes(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  // add an event listener to seek bar  **(understand it very clearly )
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

    document.querySelector(".circle").style.left = percent + "%";

    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //add an event listener for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  // add an event listener to previous
  previous.addEventListener("click", () => {
    currentsong.pause()
    console.log("previous clicked");
    
    let index =songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if((index-1)>=0)
    {
      playmusic(songs[index-1])
    }
   
  });

  // add an event listener to previous
  next.addEventListener("click", () => {
    currentsong.pause()
    console.log(" Next clicked");
    
    let index =songs.indexOf(currentsong.src.split("/").slice(-1)[0])
     if((index+1)< songs.length)
     {
       playmusic(songs[index+1])
     }
    
   })

   // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
console.log("Setting volume to",e.target.value , " / 100")
currentsong.volume= parseInt(e.target.value)/100
})
}

main();

// async function main(){
//     //get the list of all the songs
// let songs = await getSongs()
// console.log(songs)

//
//
// }

//

//
// }

// main()
