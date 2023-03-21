// Copyright (c) 2022 Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo } from "react";
import {
  Container,
  Grid,
  Header,
  Icon,
  Segment,
  Divider,
} from "semantic-ui-react";
import { Party } from "@daml/types";
import { User } from "@daml.js/game";
import { publicContext, userContext } from "./App";
import PartyListEdit from "./PartyListEdit";
import ProposeGame from "./ProposeGame";
import GameRequest from "./GameRequest";
import ActiveGames from "./ActiveGames";

// USERS_BEGIN
const MainView: React.FC = () => {
  const username = userContext.useParty();
  const myUserResult = userContext.useStreamFetchByKeys(
    User.User,
    () => [username],
    [username]
  );
  const aliases = publicContext.useStreamQueries(User.Alias, () => [], []);
  const myUser = myUserResult.contracts[0]?.payload;
  const allUsers = userContext.useStreamQueries(User.User).contracts;
  // USERS_END

  // Sorted list of users that are following the current user
  const followers = useMemo(
    () =>
      allUsers
        .map((user) => user.payload)
        .filter((user) => user.username !== username)
        .sort((x, y) => x.username.localeCompare(y.username)),
    [allUsers, username]
  );

  // Map to translate party identifiers to aliases.
  const partyToAlias = useMemo(
    () =>
      new Map<Party, string>(
        aliases.contracts.map(({ payload }) => [
          payload.username,
          payload.alias,
        ])
      ),
    [aliases]
  );

  const myUserName = aliases.loading
    ? "loading ..."
    : partyToAlias.get(username) ?? username;

  const ledger = userContext.useLedger();

  const follow = async (userToFollow: Party): Promise<boolean> => {
    try {
      await ledger.exerciseByKey(User.User.Follow, username, { userToFollow });
      return true;
    } catch (error) {
      alert(`Unknown error:\n${JSON.stringify(error)}`);
      return false;
    }
  };

  return (
    <Container>
      <Grid centered columns={2}>
        <Grid.Row stretched>
          <Grid.Column>
            <Header
              as="h1"
              size="huge"
              color="blue"
              textAlign="center"
              style={{ padding: "1ex 0em 0ex 0em" }}
            >
              {myUserName ? `Welcome, ${myUserName}!` : "Loading..."}
            </Header>

            <Segment>
              <Header as="h2">
                <Icon name="user" />
                <Header.Content>
                  {myUserName ?? "Loading..."}
                  <Header.Subheader>Users I'm following</Header.Subheader>
                </Header.Content>
              </Header>
              <Divider />
              <PartyListEdit
                parties={myUser?.following ?? []}
                partyToAlias={partyToAlias}
                onAddParty={follow}
              />
            </Segment>

            <Segment>
              <Header as="h2">
                <Icon name="pencil square" />
                <Header.Content>
                  Game Requests
                  <Header.Subheader>
                    Send a game request to a friend
                  </Header.Subheader>
                </Header.Content>
              </Header>
              <ProposeGame
                followers={followers.map((follower) => follower.username)}
                partyToAlias={partyToAlias}
              />
              <Divider />
              <GameRequest user={myUser} partyToAlias={partyToAlias} />
            </Segment>

            <Segment>
              <Header as="h2">
                <Icon name="pencil square" />
                <Header.Content>
                  Active Games
                </Header.Content>
              </Header>
              <Divider />
              <ActiveGames partyToAlias={partyToAlias} />
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default MainView;
