import React, { useState } from "react";
import { Button, List, ListItem } from "semantic-ui-react";
import { Checkers } from "@daml.js/game";
import { userContext } from "./App";
import GameModal from "./GameModal";
import { ContractId } from "@daml/types";

type Props = {
  partyToAlias: Map<string, string>;
};

const ActiveGames: React.FC<Props> = ({ partyToAlias }) => {
  const ledger = userContext.useLedger();
  const user = userContext.useParty();
  const [modalOpen, setModalOpen] = useState(false);
  const games = userContext.useStreamQueries(Checkers.Game);

  return (
    <List relaxed>
      {!games.loading &&
        games.contracts.map(({ contractId, payload }) => {
          const { gameId } = payload;

          const forfeit = async (contractId: ContractId<Checkers.Game>) =>
            await ledger
              .exercise(Checkers.Game.Forfeit, contractId, {actor: user})
              .then((res) => setModalOpen(false))
              .catch((err) => setModalOpen(false));

          return (
            <ListItem className="test-select-message-item" key={contractId}>
              <Button
                primary
                fluid
                className="test-select-login-button"
                onClick={() => setModalOpen(true)}
              >
                {gameId.ref}
              </Button>
              <GameModal
                partyToAlias={partyToAlias}
                contractId={contractId}
                game={payload}
                key={payload.gameId.ref}
                modalOpen={modalOpen}
                handleClose={() => setModalOpen(false)}
                handleForfeit={() => forfeit(contractId)}
              />
            </ListItem>
          );
        })}
    </List>
  );
};

export default ActiveGames;
