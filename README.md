# graphql-currency-scalars

## Installation

```
yarn add graphql-currency-scalars
```

## Usage

To use these scalars you'll need to add them in two places, your schema and your resolvers map.

In your schema:

```graphql
scalar USCurrency
```

In your resolver map, first import them:

```js
import {
  USCurrency
} from 'graphql-currency-scalars';
```

Then make sure they're in the root resolver map like this:

```js
const myResolverMap = {
  USCurrency,

  Query: {},

  Mutation: {},
};
```

### USCurrency

Format us cents into a fixed dollar amount.

`1000` cents would become `$10.00`
