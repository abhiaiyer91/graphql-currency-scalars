import { graphql, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { noop, isEmpty } from 'lodash';
import { expect } from 'chai';
import USCurrency from '../src/USCurrency';

const createGraphQLSchema = (queryResolver, mutationResolver = noop) => {
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        currencyValue: {
          type: USCurrency,
          resolve: queryResolver,
        },
      },
    }),
    mutation: new GraphQLObjectType({
      name: 'Mutation',
      fields: {
        setCurrency: {
          type: USCurrency,
          args: {
            currencyValue: {
              type: USCurrency,
            },
          },
          resolve: mutationResolver,
        },
      },
    }),
  });
};

describe('USCurrency', () => {
  it('should fail serializing', () => {
    const value = 'invalid';
    const schema = createGraphQLSchema(() => {
      return value;
    });
    const query = '{ currencyValue }';
    return graphql(schema, query).then((result) => {
      const { errors } = result;
      expect(errors).to.be.ok;
      expect(errors[0].message).to.eql(
        `Currency cannot represent non integer type "${value}"`
      );
    });
  });

  it('should serialize number value', () => {
    const value = 12500;
    const schema = createGraphQLSchema(() => {
      return value;
    });
    const query = '{ currencyValue }';
    return graphql(schema, query).then((result) => {
      const {
        data: { currencyValue },
      } = result;
      expect(currencyValue).to.eql('$125.00');
    });
  });

  it('should serialize number value - 2290000', () => {
    const value = 2290000;
    const schema = createGraphQLSchema(() => {
      return value;
    });
    const query = '{ currencyValue }';
    return graphql(schema, query).then((result) => {
      const {
        data: { currencyValue },
      } = result;
      expect(currencyValue).to.eql('$22,900.00');
    });
  });

  it('should fail parsing literal', () => {
    const value = 2332;
    const schema = createGraphQLSchema(noop, (source, { currencyValue }) => {
      return currencyValue;
    });
    const query = `
      mutation {
        setCurrency(currencyValue:${value})
      }
    `;
    return graphql(schema, query).catch((e) => {
      expect(e.message).to.eql(
        `Currency cannot represent an invalid currency-string ${value}.`
      );
    });
  });

  it('should fail parsing literal - 2290000', () => {
    const value = 2290000;
    const schema = createGraphQLSchema(noop, (source, { currencyValue }) => {
      return currencyValue;
    });
    const query = `
      mutation {
        setCurrency(currencyValue:${value})
      }
    `;
    return graphql(schema, query).catch((e) => {
      expect(e.message).to.eql(
        `Currency cannot represent an invalid currency-string ${value}.`
      );
    });
  });

  it('should parse literal number value', () => {
    const value = '$12.50';
    const schema = createGraphQLSchema(noop, (source, { currencyValue }) => {
      expect(currencyValue).to.eql(1250);
      return currencyValue;
    });
    const query = `
      mutation {
        setCurrency(currencyValue:"${value}")
      }
    `;
    return graphql(schema, query).then((result) => {
      expect(isEmpty(result.errors)).to.be.ok;
    });
  });

  it('should parse literal number value - 2290000', () => {
    const value = '$22,900.00';
    const schema = createGraphQLSchema(noop, (source, { currencyValue }) => {
      expect(currencyValue).to.eql(2290000);
      return currencyValue;
    });
    const query = `
      mutation {
        setCurrency(currencyValue:"${value}")
      }
    `;
    return graphql(schema, query).then((result) => {
      expect(isEmpty(result.errors)).to.be.ok;
    });
  });

  it('should parse input string value', () => {
    const value = '$12.50';
    const schema = createGraphQLSchema(noop, (source, { currencyValue }) => {
      expect(currencyValue).to.eql(1250);
      return currencyValue;
    });
    const query = `
      mutation set($currency:USCurrency!) {
        setCurrency(currencyValue:$currency)
      }
    `;
    return graphql(schema, query, null, null, { currency: value }).then(
      (result) => {
        expect(result.errors).to.be.undefined;
      }
    );
  });

  it('should parse input string value - 2290000', () => {
    const value = '$22,900.00';
    const schema = createGraphQLSchema(noop, (source, { currencyValue }) => {
      expect(currencyValue).to.eql(2290000);
      return currencyValue;
    });
    const query = `
      mutation set($currency:USCurrency!) {
        setCurrency(currencyValue:$currency)
      }
    `;
    return graphql(schema, query, null, null, { currency: value }).then(
      (result) => {
        expect(result.errors).to.be.undefined;
      }
    );
  });
});
