let currentsong = new Audio();
let songs;
let currFolder;

function convertSecondsToMinutes(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
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

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // show all the songs in the playlist

  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
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
  return songs;
}

const playmusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  currentsong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00.00/00.0";
};

async function displayalbums() {
  console.log("displaying albums");
  let a = await fetch(`http://127.0.0.1:5500 /songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardcontainer = document.querySelector(".cardcontiner");

  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
  }
  if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
    let folder = e.href.split("/").slice(-2)[0];

    // get the metadata of the folder
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
    let response = await a.json();
    console.log(response);
    cardcontainer.innerHTML =
      cardcontainer.innerHTML +
      `<div data-folder="cs" class="card">
      <div  class="play">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28"
              fill="#1fdf64">
              <circle cx="12" cy="12" r="10" stroke="lightgreen" stroke-width=".6" fill="#1fdf64" />
              <polygon points="9.5,7.5 16.5,12 9.5,16.5" fill="#000" />
          </svg>
      </div>
      <img src="/songs/${folder}/cover.jpg" alt="">
      <div class="content">
          <h2>${response.tittle}</h2>
          <p>${response.description} </p>

      </div>

  </div>`;
  }
}

// Load the playlist whenever card is clicked
Array.from(document.getElementsByClassName("card")).forEach((e) => {
  e.addEventListener("click", async (item) => {
    console.log("Fetching Songs");
    songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    console.log(songs);
  });
});

async function main() {
  // get the list of all songs

  await getSongs("songs/ncs");
  playmusic(songs[0], true);

  // display all the albums on the page
  await displayalbums();

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
    currentsong.pause();
    console.log("previous clicked");

    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playmusic(songs[index - 1]);
    }
  });

  // add an event listener to previous
  next.addEventListener("click", () => {
    currentsong.pause();
    console.log(" Next clicked");

    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playmusic(songs[index + 1]);
    }
  });

  // add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/ 100");
      currentsong.volume = parseInt(e.target.value) / 100;
    });

  //add an event listener to mute the volume

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentsong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentsong.volume = 1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 30;
    }
  });
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
