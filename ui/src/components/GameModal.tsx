import React from "react";
import { Modal, Header, Button } from "semantic-ui-react";
import GameBoard from "./GameBoard";
import { Checkers } from "@daml.js/game";
import { ContractId } from "@daml/types";

type Props = {
  partyToAlias: Map<string, string>;
  contractId: ContractId<Checkers.Game>;
  game: Checkers.Game;
  modalOpen: boolean | undefined;
  handleClose: () => void;
  handleForfeit: () => void;
};

const GameModal: React.FC<Props> = ({
  partyToAlias,
  contractId,
  game,
  modalOpen,
  handleClose,
  handleForfeit,
}) => (
  <Modal open={modalOpen} size="small" closeOnEscape>
    <Header>
      {partyToAlias.get(game.gameId.red)} vs {partyToAlias.get(game.gameId.black)}
    </Header>
    <Modal.Content>
      <GameBoard contractId={contractId} game={game} />
    </Modal.Content>
    <Modal.Actions>
      <Button
        primary
        type="button"
        icon="window close"
        labelPosition="right"
        onClick={handleClose}
        content="Close"
      />
      <Button
        negative
        type="button"
        icon="stop circle"
        labelPosition="right"
        onClick={handleForfeit}
        content="Forfeit"
      />
    </Modal.Actions>
  </Modal>
);

export default GameModal;
