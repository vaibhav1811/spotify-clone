let currentSong = new Audio();
let songs = [];
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
  let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
  let text = await response.text();
  let div = document.createElement("div");
  div.innerHTML = text;
  let links = div.getElementsByTagName("a");
  songs = Array.from(links)
    .filter(link => link.href.endsWith(".mp3"))
    .map(link => link.href.split(`/${folder}/`)[1].replace("%20", " "));

  // Display songs in the playlist
  let songUL = document.querySelector(".songlist ul");
  songUL.innerHTML = songs.map(song =>
    `<li>
      <img src="img/music.svg" alt="">
      <div class="info">
        <div>${decodeURI(song)}</div>
        <div>Artist Name</div>
      </div>
      <div class="playnow">
        <span>play now</span>
        <img src="play.svg" alt="">
      </div>
    </li>`
  ).join("");

  // Attach event listeners to each song
  songUL.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {
      playMusic(li.querySelector(".info div:first-child").textContent.trim());
    });
  });

  return songs;
}

function playMusic(track, pause = false) {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }

  document.querySelector(".songinfo").textContent = decodeURI(track);
  document.querySelector(".songtime").textContent = "00:00 / 00:00";
}

async function displayAlbums() {
  let response = await fetch(`http://127.0.0.1:5500/songs/`);
  let text = await response.text();
  let div = document.createElement("div");
  div.innerHTML = text;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardcontainer");

  Array.from(anchors).forEach(async (e) => {
    if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
      let folder = e.href.split("/").slice(-2)[0];

      // Fetch folder metadata
      let response = await fetch(`/${folder}/info.json`);
      let info = await response.json();

      cardContainer.innerHTML + `
        <div data-folder="cs" class="card">
          <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="28" height="28" fill="#1fdf64">
              <circle cx="12" cy="12" r="10" stroke="lightgreen" stroke-width=".6" fill="#1fdf64" />
              <polygon points="9.5,7.5 16.5,12 9.5,16.5" fill="#000" />
            </svg>
          </div>
          <img src="/songs/${folder}/cover.jpg" alt="">
          <div class="content">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
          </div>
        </div>`;
    }
  });
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
  await getSongs("songs/ncs");
  playMusic(songs[0], true);
  await displayAlbums();

  // Event listeners
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  currentSong.addEventListener("timeupdate", () => {
    let currentTime = currentSong.currentTime;
    let duration = currentSong.duration;
    document.querySelector(".songtime").textContent = `${convertSecondsToMinutes(currentTime)} / ${convertSecondsToMinutes(duration)}`;
    document.querySelector(".circle").style.left = `${(currentTime / duration) * 100}%`;
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = `${percent}%`;
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%";
  });

  previous.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if ((index + 1 )< songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document.querySelector(".range input").addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  });

  document.querySelector(".volume img").addEventListener("click", (e) => {
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range input").value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 1;
      document.querySelector(".range input").value = 30;
    }
  });

  // Dark and Bright Theme Toggle
  let themeToggle = document.querySelector(".theme-toggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    let currentTheme = document.body.classList.contains("dark-theme") ? "dark" : "bright";
    themeToggle.textContent = `${currentTheme} theme`;
  });
}

main();
