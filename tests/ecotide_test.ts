import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can create a new project",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    
    let block = chain.mineBlock([
      Tx.contractCall('ecotide', 'create-project', [
        types.ascii("Beach Cleanup"),
        types.ascii("Monthly beach cleanup initiative"),
        types.uint(10),
        types.uint(1000)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectUint(1);
    
    const response = chain.callReadOnlyFn(
      'ecotide',
      'get-project-details',
      [types.uint(1)],
      deployer.address
    );
    response.result.expectOk();
  }
});

Clarinet.test({
  name: "Can join an existing project",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Create project
    let block = chain.mineBlock([
      Tx.contractCall('ecotide', 'create-project', [
        types.ascii("Beach Cleanup"),
        types.ascii("Monthly beach cleanup initiative"),
        types.uint(10),
        types.uint(1000)
      ], deployer.address)
    ]);
    
    // Join project
    block = chain.mineBlock([
      Tx.contractCall('ecotide', 'join-project', [
        types.uint(1)
      ], wallet1.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
  }
});

Clarinet.test({
  name: "Cannot join full project",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Create project with 1 max participant
    let block = chain.mineBlock([
      Tx.contractCall('ecotide', 'create-project', [
        types.ascii("Beach Cleanup"),
        types.ascii("Monthly beach cleanup initiative"),
        types.uint(1),
        types.uint(1000)
      ], deployer.address)
    ]);
    
    // First join succeeds
    block = chain.mineBlock([
      Tx.contractCall('ecotide', 'join-project', [
        types.uint(1)
      ], wallet1.address)
    ]);
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Second join fails
    block = chain.mineBlock([
      Tx.contractCall('ecotide', 'join-project', [
        types.uint(1)
      ], deployer.address)
    ]);
    block.receipts[0].result.expectErr().expectUint(102);
  }
});

Clarinet.test({
  name: "Can complete project and distribute rewards",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Create and join project
    let block = chain.mineBlock([
      Tx.contractCall('ecotide', 'create-project', [
        types.ascii("Beach Cleanup"),
        types.ascii("Monthly beach cleanup initiative"),
        types.uint(10),
        types.uint(1000)
      ], deployer.address),
      Tx.contractCall('ecotide', 'join-project', [
        types.uint(1)
      ], wallet1.address)
    ]);
    
    // Complete project
    block = chain.mineBlock([
      Tx.contractCall('ecotide', 'complete-project', [
        types.uint(1)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
  }
});
