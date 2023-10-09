const discordStatusAPIurl = "https://myspotify.many.win/info/discord";
const SpotifyStatusAPIurl = "https://myspotify.many.win/info/spotify";
const SpotifyAddSongAPIurl = "https://myspotify.many.win/music/add";
let addMusicCooldown = false;
let addMusicTimeout;
let activityDiv;
let activityDivData = [];

const elements = {
	statusBox: document.getElementById("status"),
	statusImage: document.getElementById("status-image"),
	avatarImage: document.getElementById("avatar-image"),
	bannerImage: document.getElementById("banner-image"),
	bannerColor: document.querySelector(".banner"),
	displayName: document.querySelector(".display-name"),
	username: document.querySelector(".username"),
	badges: document.querySelector(".badges-left"),
	customStatus: document.querySelector(".custom-status"),
	customStatusText: document.querySelector(".custom-status-text"),
	customStatusEmoji: document.getElementById("custom-status-emoji"),
	spotifyBox: document.getElementById("spotify"),
	spotifyImg: document.getElementById("spotify-img"),
	spotifyName: document.getElementById("spotify-song-name"),
	songInputUrl: document.getElementById("song-input"),
	activityBox: document.getElementById("whatamidoing")
};

document.getElementById("song-submit").addEventListener("click", addSong);

async function fetchDiscordStatus() {
	try {
		const userDiscord = await fetch(discordStatusAPIurl).then((response) => {
			return response.json();
		});
		const userSpotify = await fetch(SpotifyStatusAPIurl).then((response) => {
			return response.json();
		});

		elements.displayName.innerHTML = userDiscord["user"]["globalName"];
		elements.username.innerHTML = '@' + userDiscord["user"]["username"];

		let imagePath;
		switch (userDiscord["presence"]) {
			case "online":
				imagePath = "./public/status/online.svg";
				break;
			case "idle":
				imagePath = "./public/status/idle.svg";
				break;
			case "dnd":
				imagePath = "./public/status/dnd.svg";
				break;
			case "offline":
				imagePath = "./public/status/offline.svg";
				break;
			case "online-mobile":
				imagePath = "./public/status/online-mobile.svg";
				break;
			case "idle-mobile":
				imagePath = "./public/status/idle-mobile.svg";
				break;
			case "dnd-mobile":
				imagePath = "./public/status/dnd-mobile.svg";
				break;
			case "offline-mobile":
				imagePath = "./public/status/offline-mobile.svg";
				break;
			default:
				imagePath = "./public/status/offline.svg";
				break;
		}

		if (
			userDiscord["activities"].find(
				(activity) =>
					activity.type === 1 &&
					(activity.url.includes("twitch.tv") ||
						activity.url.includes("youtube.com"))
			)
		) {
			imagePath = "./public/status/streaming.svg";
		}

		if (userDiscord["user"]["banner"] == null) {
			elements.bannerImage.src =
				"https://manybahtpage.com/images/laiok.webp";
		} else {
			elements.bannerImage.src = `https://cdn.discordapp.com/banners/${userDiscord["user"]["id"]}/${userDiscord["user"]["banner"]}?format=webp&size=1024`;
			elements.bannerImage.alt = `Discord banner: ${userDiscord["user"]["username"]}`;
		}

		elements.statusImage.src = imagePath;
		elements.statusImage.alt = `Discord status: ${userDiscord["presence"]}`;
		elements.bannerColor.style.backgroundColor = userDiscord["user"]["hexAccentColor"];
		elements.avatarImage.src = `https://cdn.discordapp.com/avatars/${userDiscord["user"]["id"]}/${userDiscord["user"]["avatar"]}?format=webp&size=1024`;
		elements.avatarImage.alt = `Discord avatar: ${userDiscord["user"]["username"]}`;

		if (userDiscord["activities"][0]?.name == "Spotify") elements.customStatusText.innerHTML = "Listening to Spotify"
		else elements.customStatusText.innerHTML = userDiscord["activities"][0]?.state != null ? userDiscord["activities"][0]?.state : "Probably sleeping...";

		if (userDiscord["activities"][0]?.emoji == null) {
			elements.customStatusEmoji.style.display = "none";
		} else {
			elements.customStatusEmoji.src = `https://cdn.discordapp.com/emojis/${userDiscord["activities"][0]?.emoji.id}?format=webp&size=128&quality=lossless`;
			elements.customStatusEmoji.style.display = "block";
			elements.customStatusEmoji.style.marginRight = "5px";
		}

		if (userDiscord["activities"][0]?.state == null && userDiscord["activities"][0]?.emoji == null) {
			elements.customStatus.style.display = "none";
			elements.customStatusEmoji.style.display = "none";
			elements.customStatusText.style.display = "none";
		} else {
			elements.customStatus.style.display = "flex";
		}

		if (userDiscord["activities"]) {
			const activities = userDiscord["activities"].filter(item => item.type === 0);
			if (activities.length <= 0) return elements.activityBox.style.display = "none";
			let check = true;
			if (activityDiv && activities.length === activityDivData.length) {
				for (let i = 0; i < activities.length; i++) {
					if (activities[i]?.["timestamps"]?.["start"] !== activityDivData[i]) check = false;
				}
				if (check) {
					for (let i = 0; i < activities.length; i++) {
						const changeImage = document.getElementById("activityImage-" + i);
						const changeInfo = document.getElementById("activityInfo-" + i);
						changeImage.src = activities[i]?.["assets"]?.["largeImage"] ? 'https://' + activities[i]?.["assets"]?.["largeImage"].split('/').slice(3).join('/') : 'https://cdn.jsdelivr.net/gh/manybaht/manybaht.github.io@main/storages/images/laibaht_arts/23.png';
						changeInfo.innerHTML = `
							${activities[i]?.["name"] ? activities[i]?.["name"] : '🖥️'}
							<div class="text-base platform-username-notbold">
								${activities[i]?.["details"] ? activities[i]?.["details"] : '📝'}
							</div>
							<div class="text-base platform-username-notbold">
								${activities[i]?.["state"] ? activities[i]?.["state"] : '👨‍💻'}
							</div>
							<div class="text-base platform-username-notbold">
								${activities[i]?.["timestamps"]?.["start"] ? parseTime(activities[i]?.["timestamps"]?.["start"]) + ' elapsed' : '⏰'}
							</div>
						`
					}
				}
			} else check = false;
			if (!check) {
				activityDivData = [];
				let activitiesBuilder = `
				<div class="title-body">
					<img
					class="platform-icon-spotify-inside"
					alt=" "
					aria-hidden="true"
					src="./public/icons/discord.svg" />
					&nbsp;MY ACTIVITES
				</div>
				`;
				for (let i = 0; i < activities.length; i++) {
					let timeElapsed;
					if (activities[i]?.["timestamps"]?.["start"]) activityDivData.push(activities[i]?.["timestamps"]?.["start"]);
					activitiesBuilder += `
					<div class="platform-spotify">
						<img
							id="activityImage-${i}"
							class="platform-icon-spotify"
							alt=" "
							aria-hidden="true"
							src="${activities[i]?.["assets"]?.["largeImage"] ? 'https://' + activities[i]?.["assets"]?.["largeImage"].split('/').slice(3).join('/') : 'https://cdn.jsdelivr.net/gh/manybaht/manybaht.github.io@main/storages/images/laibaht_arts/23.png'}" />
						<div id="activityInfo-${i}" class="text-base platform-username">
							${activities[i]?.["name"] ? activities[i]?.["name"] : '🖥️'}
							<div class="text-base platform-username-notbold">
								${activities[i]?.["details"] ? activities[i]?.["details"] : '📝'}
							</div>
							<div class="text-base platform-username-notbold">
								${activities[i]?.["state"] ? activities[i]?.["state"] : '👨‍💻'}
							</div>
							<div class="text-base platform-username-notbold">
								${activities[i]?.["timestamps"]?.["start"] ? parseTime(activities[i]?.["timestamps"]?.["start"]) + ' elapsed' : '⏰'}
							</div>
						</div>
					</div>
					`
				}
				elements.activityBox.innerHTML = "";
				activityDiv = document.createElement('activityDiv');
				activityDiv.innerHTML= activitiesBuilder;
				elements.activityBox.appendChild(activityDiv);
				elements.activityBox.style.display = "block";
			}
		} else elements.activityBox.style.display = "none";

		const ms = userSpotify["progress_ms"];
		const msTotal = userSpotify["item"]?.["duration_ms"];

		if (userSpotify["item"]) {
			elements.spotifyImg.src = userSpotify["item"]?.["album"]?.["images"]?.[0]?.["url"] ?? "https://cdn.jsdelivr.net/gh/manybaht/manybaht.github.io@main/storages/images/laibaht_arts/23.png";
			elements.spotifyName.innerHTML = `${userSpotify["item"]?.["name"] ?? "🎶🎶🎶"}
			<div class="text-base platform-username-notbold">
				by ${userSpotify["item"]?.["artists"]?.[0]?.["name"] ?? "🧑‍🎤"}
			</div>
			<div class="text-base platform-username-notbold">
				on ${userSpotify["item"]?.["album"]?.["name"] ?? "💿"}
			</div>
			<div class="text-base platform-username-notbold">
				${ms ? new Date(ms).toISOString().slice(11, 19) : "⌛"} / ${msTotal ? new Date(msTotal).toISOString().slice(11, 19) : "⌛"}
			</div>
			`
			elements.spotifyBox.style.display = "block";
		} else elements.spotifyBox.style.display = "none";
	} catch (error) {
		console.error("Unable to retrieve Discord status:", error);
	}
}

function addSong(e) {
	e.preventDefault();
    e.stopPropagation();
	if (addMusicCooldown) return;
	let songUrl = elements.songInputUrl.value;
	elements.songInputUrl.disabled = true;

	const parser = document.createElement("a");
	parser.href = songUrl;
	if (parser.hostname !== "spotify.link") {
		const indexOfSi = songUrl.indexOf("?si=");
		songUrl = indexOfSi !== -1 ? songUrl.slice(0, indexOfSi) : songUrl;
		const regex = /\/track\/([^?]+)/;
		songUrl = songUrl.match(regex);
		if (songUrl) {
			songUrl = songUrl[1];
		} else {
			return cooldown("Bad Spotify url pattern.");
		}
	}

	elements.songInputUrl.value = "Sending request...";
	const reqHeaders = new Headers();
	reqHeaders.append("Content-Type", "application/json");
	const reqOpt = {
		method: 'POST',
		headers: reqHeaders,
		body: JSON.stringify({
			songid: songUrl
		}),
	};
	
	fetch(SpotifyAddSongAPIurl, reqOpt)
	.then(response => response.json())
	.then(result => {
		if (result["error"]) {
			elements.songInputUrl.style.color = "red";
			return cooldown(result["error"]);
		} else {
			elements.songInputUrl.style.color = "#90EE90";
			return cooldown("Song added!");
		}
	})
	.catch(error => {
		console.log('error', error)
		return cooldown("Script error.");
	});
}

function cooldown(m) {
	if (m) elements.songInputUrl.value = m;
	addMusicTimeout = setTimeout(() => {
		elements.songInputUrl.value = "";
		elements.songInputUrl.style.color = "";
		elements.songInputUrl.disabled = false;
	}, 3000);
}

function parseTime(time) {
	const targetDateTime = new Date(time);
	const currentTime = new Date();
	const elapsedTM = currentTime - targetDateTime;
	const seconds = Math.floor(elapsedTM / 1000) % 60;
	const minutes = Math.floor(elapsedTM / 1000 / 60) % 60;
	const hours = Math.floor(elapsedTM / 1000 / 3600);
	return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

const randomInputPH = setInterval(() => {
	if (elements.songInputUrl.placeholder == "https://open.spotify.com/track/42TLIkJ2kFSY0WlCBjqzhB")
		elements.songInputUrl.placeholder = "https://spotify.link/JJhfeOxJKDb";
	else elements.songInputUrl.placeholder = "https://open.spotify.com/track/42TLIkJ2kFSY0WlCBjqzhB";
}, 5000);

// Mapping badges to their respective images
const badgeMappings = {
	HOUSE_BRILLIANCE: "./public/badges/hypesquad-brilliance.svg",
	ACTIVE_DEVELOPER: "./public/badges/active-developer.svg",
	HOUSE_BRAVERY: "./public/badges/hypesquad-bravery.svg",
	HOUSE_BALANCE: "./public/badges/hypesquad-balance.svg",
	EARLY_SUPPORTER: "./public/badges/early-supporter.svg",
	EARLY_VERIFIED_BOT_DEVELOPER:
		"./public/badges/early-verified-bot-developer.svg",
	PARTNERED_SERVER_OWNER: "./public/badges/discord-partner.svg",
	LEGACY_USER: "./public/badges/legacy-username.svg",
	NITRO: "./public/badges/nitro.svg",
};

// Logic for tooltips
const tooltips = document.querySelectorAll(".tooltip");
tooltips.forEach((tooltip) => {
	tooltip.addEventListener("mouseenter", () => {
		const ariaLabel = tooltip.getAttribute("aria-label");
		tooltip.setAttribute("data-tooltip-content", ariaLabel);
	});

	tooltip.addEventListener("mouseleave", () => {
		tooltip.removeAttribute("data-tooltip-content");
	});
});

// const links = document.querySelectorAll("a");

// links.forEach((link) => {
// 	const href = link.getAttribute("href");
// 	link.setAttribute("title", href);
// });

const anchors = document.getElementsByTagName("a");

for (let i = 0; i < anchors.length; i++) {
	const anchor = anchors[i];
	const href = anchor.getAttribute("href");
	if (href) {
		anchor.setAttribute("title", href);
	}
}

// Fetch Discord status on page load
fetchDiscordStatus();
// Fetch Discord status every 5 seconds
setInterval(fetchDiscordStatus, 5000);