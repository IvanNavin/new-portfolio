import { io } from "socket.io-client";
import "./index.scss";
import ClientGame from "./client/ClientGame";
import { getTime, escapeHtml } from "./common/util";
import world from "./configs/world.json";
import sprites from "./configs/sprites";
import gameObjects from "./configs/gameObjects.json";

window.addEventListener("load", async () => {
  const socket = io(window.location.origin);
  const startGame = document.querySelector(".start-game");
  const nameForm = document.getElementById("nameForm");
  const warning = nameForm.querySelector(".warning");

  const chatWrap = document.querySelector(".chat-wrap");
  const chatForm = document.getElementById("form");
  const messageBox = chatWrap.querySelector(".message");
  const canvas = document.getElementById("world");
  const skinPicker = document.querySelector(".skin-picker");

  let isFirstConnection = true;
  let currentUserId = "";

  startGame.style.display = "flex";

  // Keep the newest message in view. Only auto-scroll when the user is already
  // near the bottom, so reading history isn't yanked away by incoming messages.
  const appendMessage = (html) => {
    const nearBottom =
      messageBox.scrollHeight - messageBox.scrollTop - messageBox.clientHeight <
      60;
    messageBox.insertAdjacentHTML("beforeend", html);
    if (nearBottom) messageBox.scrollTop = messageBox.scrollHeight;
  };

  const showWarning = (text) => {
    warning.textContent = text;
    warning.style.opacity = "1";
  };
  const hideWarning = () => {
    warning.style.opacity = "0";
  };

  // Skin picker: keep exactly one option selected. The default is set in HTML.
  let selectedSkin =
    document.querySelector(".skin-option.is-selected")?.dataset.skin || "girl1";
  skinPicker?.addEventListener("click", (event) => {
    const option = event.target.closest(".skin-option");
    if (!option) return;
    skinPicker
      .querySelectorAll(".skin-option")
      .forEach((btn) => btn.classList.remove("is-selected"));
    option.classList.add("is-selected");
    selectedSkin = option.dataset.skin;
  });

  // Tap / click a tile to walk there (mobile-friendly; also works with the
  // mouse). The canvas is CSS-scaled, so map client coords back into its
  // internal pixel space before handing them to the game.
  const bindCanvasTap = () => {
    canvas.addEventListener("pointerdown", (e) => {
      const game = ClientGame.game;
      if (!game || !game.player) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      game.onCanvasTap(x, y);
    });
  };

  const submitName = (event) => {
    event.preventDefault();
    const name = nameForm.name.value.trim();

    if (!name.length) {
      showWarning("Enter a name to start.");
      return;
    }

    if (name.length > 12) {
      showWarning("That name is too long — keep it under 12 characters.");
      return;
    }

    hideWarning();

    // Pass the existing socket to the game API to avoid duplicate connections
    ClientGame.init({
      tagID: "world",
      playerName: name,
      skin: selectedSkin,
      world,
      sprites,
      gameObjects,
      apiCfg: {
        socket, // Reuse existing socket!
      },
    });

    socket.emit("start", { name, skin: selectedSkin });
    bindCanvasTap();

    chatWrap.style.display = "flex";
    nameForm.removeEventListener("submit", submitName);
    startGame.remove();
  };

  const submitMessage = (event) => {
    event.preventDefault();
    const input = chatForm.message;

    if (input.value.trim()) {
      socket.emit("chat message", input.value);
      input.value = "";
    }
  };

  nameForm.addEventListener("submit", submitName);
  nameForm.name.addEventListener("input", hideWarning);
  chatForm.addEventListener("submit", submitMessage);

  socket.on("chat online", ({ online }) => {
    chatWrap.dataset.online = online;
  });

  socket.on("chat connection", ({ time, msg, id }) => {
    if (isFirstConnection) {
      currentUserId = id;
      isFirstConnection = false;
    }

    appendMessage(
      `<p><strong>${getTime(time)}</strong> ${escapeHtml(msg)}</p>`,
    );
  });

  socket.on("chat disconnect", ({ time, msg }) => {
    appendMessage(
      `<p><strong>${getTime(time)}</strong> ${escapeHtml(msg)}</p>`,
    );
  });

  socket.on("chat message", ({ name, time, msg, id }) => {
    const isCurrentUser = currentUserId === id;

    appendMessage(
      `<p class="msg-box ${isCurrentUser ? "isCurrentUser" : ""}">
              <span class="name">${escapeHtml(name)}</span>
              <span class="msg" data-time="${getTime(time)}">${escapeHtml(msg)}</span>
            </p>`,
    );
  });
});
