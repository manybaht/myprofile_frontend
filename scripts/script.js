const discordStatusAPIurl = "https://myspotify.many.win/info/discord";
const SpotifyStatusAPIurl = "https://myspotify.many.win/info/spotify";

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
	spotifyName: document.getElementById("spotify-song-name")
};

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

		elements.customStatusText.innerHTML =
			userDiscord["activities"][0]?.state != null ? userDiscord["activities"][0]?.state : "Probably sleeping...";

		if (userDiscord["activities"][0]?.emoji == null) {
			elements.customStatusEmoji.style.display = "none";
		} else {
			elements.customStatusEmoji.src = `https://cdn.discordapp.com/emojis/${userDiscord["activities"][0]?.emoji.id}?format=webp&size=24&quality=lossless`;
			elements.customStatusEmoji.style.marginRight = "5px";
		}

		if (userDiscord["activities"][0]?.state == null && userDiscord["activities"][0]?.emoji == null) {
			elements.customStatus.style.display = "none";
			elements.customStatusEmoji.style.display = "none";
			elements.customStatusText.style.display = "none";
			elements.customStatus.removeAttribute("style");
			elements.customStatusEmoji.removeAttribute("style");
			elements.customStatusText.removeAttribute("style");
		} else {
			elements.customStatus.style.display = "flex";
		}

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