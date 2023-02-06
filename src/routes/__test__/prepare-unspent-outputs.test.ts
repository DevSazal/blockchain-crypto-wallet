import request from 'supertest';
import nock from 'nock';
import { app } from '../../app';

// A wallet address used throughout the tests
const address = '31otE5wkfiCSXcQPjfWZ8eLuZRFZfLrmci';

// Mock Blockchain.com API response. A list of outputs with values 3, 8, 6, 9, 1
const unspentOutputs = [
  {
    tx_hash_big_endian:
      'f35b0fd3954cfdc817cf1a2747236b3a105886a986fbbfbb222b0af1584333fa',
    tx_hash: 'fa334358f10a2b22bbbffb86a98658103a6b2347271acf17c8fd4c95d30f5bf3',
    tx_output_n: 0,
    script: 'a914014c7c73f43e33a099f915761cd0ff5d1145183287',
    value: 3,
    value_hex: '040356',
    confirmations: 1095,
    tx_index: 8803138565710149,
  },
  {
    tx_hash_big_endian:
      'f35b0fd3954cfdc817cf1a2747236b3a105886a986fbbfbb222b0af1584333fa',
    tx_hash: 'fa334358f10a2b22bbbffb86a98658103a6b2347271acf17c8fd4c95d30f5bf3',
    tx_output_n: 1,
    script: 'a914014c7c73f43e33a099f915761cd0ff5d1145183287',
    value: 8,
    value_hex: '040356',
    confirmations: 1095,
    tx_index: 8803138565710149,
  },
  {
    tx_hash_big_endian:
      'f35b0fd3954cfdc817cf1a2747236b3a105886a986fbbfbb222b0af1584333fa',
    tx_hash: 'fa334358f10a2b22bbbffb86a98658103a6b2347271acf17c8fd4c95d30f5bf3',
    tx_output_n: 2,
    script: 'a914014c7c73f43e33a099f915761cd0ff5d1145183287',
    value: 6,
    value_hex: '040356',
    confirmations: 1095,
    tx_index: 8803138565710149,
  },
  {
    tx_hash_big_endian:
      'f35b0fd3954cfdc817cf1a2747236b3a105886a986fbbfbb222b0af1584333fa',
    tx_hash: 'fa334358f10a2b22bbbffb86a98658103a6b2347271acf17c8fd4c95d30f5bf3',
    tx_output_n: 3,
    script: 'a914014c7c73f43e33a099f915761cd0ff5d1145183287',
    value: 9,
    value_hex: '040356',
    confirmations: 1095,
    tx_index: 8803138565710149,
  },
  {
    tx_hash_big_endian:
      'f35b0fd3954cfdc817cf1a2747236b3a105886a986fbbfbb222b0af1584333fa',
    tx_hash: 'fa334358f10a2b22bbbffb86a98658103a6b2347271acf17c8fd4c95d30f5bf3',
    tx_output_n: 4,
    script: 'a914014c7c73f43e33a099f915761cd0ff5d1145183287',
    value: 1,
    value_hex: '040356',
    confirmations: 1095,
    tx_index: 8803138565710149,
  },
];

// Set up mock Blockchain.com API response
beforeAll(() => {
  nock('https://blockchain.info')
    .persist()
    .get('/unspent')
    .query({ active: address })
    .reply(200, { unspent_outputs: unspentOutputs });
});

/* GIVEN a list of outputs with values 3, 8, 6, 9, 1
 * AND   a purchase amount of 4
 * WHEN  request to /api/prepare-unspent-outputs is made
 * THEN  outputs with values 1 & 3 should be returned */
it('uses first strategy if possible', async () => {
  const response = await request(app)
    .get('/api/prepare-unspent-outputs')
    .query({ address, amount: 4 })
    .send();

  expect(response.status).toBe(200);
  expect(response.body).toEqual([
    {
      tx_hash_big_endian:
        'f35b0fd3954cfdc817cf1a2747236b3a105886a986fbbfbb222b0af1584333fa',
      tx_hash:
        'fa334358f10a2b22bbbffb86a98658103a6b2347271acf17c8fd4c95d30f5bf3',
      tx_output_n: 4,
      script: 'a914014c7c73f43e33a099f915761cd0ff5d1145183287',
      value: 1,
      value_hex: '040356',
      confirmations: 1095,
      tx_index: 8803138565710149,
    },
    {
      tx_hash_big_endian:
        'f35b0fd3954cfdc817cf1a2747236b3a105886a986fbbfbb222b0af1584333fa',
      tx_hash:
        'fa334358f10a2b22bbbffb86a98658103a6b2347271acf17c8fd4c95d30f5bf3',
      tx_output_n: 0,
      script: 'a914014c7c73f43e33a099f915761cd0ff5d1145183287',
      value: 3,
      value_hex: '040356',
      confirmations: 1095,
      tx_index: 8803138565710149,
    },
  ]);
});

/* GIVEN a list of outputs with values 3, 8, 6, 9, 1
 * AND   purchase amount of 5
 * WHEN  request to /api/prepare-unspent-outputs is made
 * THEN  output with value 6 should be returned */
it('falls back to second strategy if first strategy fails', async () => {
  const response = await request(app)
    .get('/api/prepare-unspent-outputs')
    .query({ address, amount: 5 })
    .send();

  expect(response.status).toBe(200);
  expect(response.body).toEqual([
    {
      tx_hash_big_endian:
        'f35b0fd3954cfdc817cf1a2747236b3a105886a986fbbfbb222b0af1584333fa',
      tx_hash: 'fa334358f10a2b22bbbffb86a98658103a6b2347271acf17c8fd4c95d30f5bf3',
      tx_output_n: 2,
      script: 'a914014c7c73f43e33a099f915761cd0ff5d1145183287',
      value: 6,
      value_hex: '040356',
      confirmations: 1095,
      tx_index: 8803138565710149,
    },
  ]);
});

/* GIVEN a list of outputs with values 3, 8, 6, 9, 1
 * AND   purchase amount of 28
 * WHEN  request to /api/prepare-unspent-outputs is made
 * THEN  'Not enough funds' error should be returned */
it('returns error if both strategies fail', async () => {
  const response = await request(app)
    .get('/api/prepare-unspent-outputs')
    .query({ address, amount: 28 })
    .send();

  expect(response.status).toBe(409);
  expect(response.body).toEqual({ message: 'Not enough funds' });
});
