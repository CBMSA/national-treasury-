

module SadcWallet::wallet_module {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};

    struct Wallet has key {
        id: UID,
        owner: address,
        balance: u64
    }

    public fun create_wallet(ctx: &mut TxContext): Wallet {
        Wallet {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            balance: 1000000000 // Starting balance
        }
    }

    public fun get_balance(wallet: &Wallet): u64 {
        wallet.balance
    }

    public fun credit(wallet: &mut Wallet, amount: u64) {
        wallet.balance = wallet.balance + amount;
    }

    public fun debit(wallet: &mut Wallet, amount: u64) {
        assert!(wallet.balance >= amount, 1);
        wallet.balance = wallet.balance - amount;
    }

    public fun transfer(sender: &mut Wallet, recipient: &mut Wallet, amount: u64) {
        debit(sender, amount);
        credit(recipient, amount);
    }
}
