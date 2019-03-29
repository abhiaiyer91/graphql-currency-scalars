import { GraphQLScalarType } from 'graphql';
import formatCurrency from 'format-currency'
import { Kind } from 'graphql/language';
import { isString, isNumber } from 'lodash';

function generateCurrency(value) {
  if (!isNumber(value)) {
    throw new TypeError(
      `Currency cannot represent non integer type ${JSON.stringify(value)}`
    );
  }

  let opts = { format: '%s%v', code: 'USD', symbol: '$' }

  const currencyInCents = parseInt(value, 10);

  return formatCurrency(currencyInCents / 100, opts)
}

function generateCents(value) {
  const digits = value.replace('$', '').replace(',', '');
  const number = parseFloat(digits, 10);
  return number * 100;
}

/**
 * An Currency Scalar.
 *
 * Input:
 *    This scalar takes a currency string as input and
 *    formats it to currency in cents.
 *
 * Output:
 *    This scalar serializes currency in cents to
 *    currency strings.
 */
const config = {
  name: 'USCurrency',
  description: 'A currency string, such as $21.25',
  serialize: generateCurrency,
  parseValue(value) {
    if (!isString(value)) {
      throw new TypeError(
        `Currency cannot represent non string type ${JSON.stringify(value)}`
      );
    }

    if (isString(value)) {
      return generateCents(value);
    }
    throw new TypeError(
      `Currency cannot represent an invalid currency-string ${value}.`
    );
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      if (isString(ast.value)) {
        return generateCents(ast.value);
      }
    }
    throw new TypeError(
      `Currency cannot represent an invalid currency-string ${ast.value}.`
    );
  },
};

export default new GraphQLScalarType(config);
