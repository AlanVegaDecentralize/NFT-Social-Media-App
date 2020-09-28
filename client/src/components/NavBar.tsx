import React from "react";
import { Box, Flex, Link, Button, Heading } from "@chakra-ui/core";
import NextLink from "next/link";

import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({ pause: isServer() });
  let body = null;

  // data is loading
  if (fetching) {
    body = (
      <NextLink href="/register">
        <Link mr={2}>register</Link>
      </NextLink>
    );
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link mr={2}>register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex alignItems="center">
        <Box mr={3}>{data.me.username}</Box>
        <Box mr={3}>
          <NextLink href="/create-post">
            <Button ml={2} as={Link}>
              create post
            </Button>
          </NextLink>
        </Box>
        <Button
          variant="link"
          onClick={() => logout()}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex
      zIndex={1}
      position="sticky"
      top={0}
      bg="tan"
      p={4}
      ml="auto"
      alignContent="center"
    >
      <NextLink href={"/"}>
        <Link>
          <Heading>Tgthr</Heading>
        </Link>
      </NextLink>
      <Box ml={"auto"}>{body}</Box>
    </Flex>
  );
};

export default NavBar;
