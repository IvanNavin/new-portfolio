import ClientGameObject from "./ClientGameObject";

class ClientPlayer extends ClientGameObject {
  constructor(cfg) {
    super(cfg);

    // Needed so ClientApi.onPlayerMove can tell this player apart from others.
    // Without it the local player would re-apply its own (network-delayed)
    // server echoes and rubber-band back to old cells while walking.
    this.playerId = cfg.objCfg.playerId;
    this.playerName = cfg.objCfg.playerName;
  }

  render(time) {
    super.render(time);

    const { world } = this;

    world.engine.renderSign({
      x: this.x + world.cellWidth / 2,
      y: this.y - 15,
      minWidth: world.cellWidth,
      maxWidth: world.cellWidth * 1.5,
      text: this.playerName,
    });
  }
}

export default ClientPlayer;
