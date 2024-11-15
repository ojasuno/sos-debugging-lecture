#![allow(clippy::result_large_err)]
use anchor_lang::prelude::*;

declare_id!("Gp3jcr7dqCcgp3QbQdcwjS5p5n5usRLoxesQuNaHm4GD");

#[program]
pub mod solana_errors {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, count: u8) -> Result<()> {
        let data = &mut ctx.accounts.data;

        require!(count <= 10, MyError::InvalidCountValue);

        data.authority = ctx.accounts.user.key();
        data.counter = math_sub(count).unwrap();

        msg!("data.counter = {}", data.counter);
        msg!("data pubkey = {}", data.key().to_string());
        msg!("user pubkey = {}", data.authority.key().to_string());

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    user: Signer<'info>,

    #[account(init,
        space = 8 + 32 + 1,
        payer = user,
        seeds = [b"ackee"],
        bump
    )]
    data: Account<'info, MyData>,

    system_program: Program<'info, System>,
}

#[account]
pub struct MyData {
    authority: Pubkey,
    counter: u8,
}

#[error_code]
pub enum MyError {
    #[msg("Invalid Count Value")]
    InvalidCountValue,
}

fn math_sub(count: u8) -> Option<u8> {
    10u8.checked_sub(count)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_math_sub() {
        assert_eq!(math_sub(2), Some(8));
        assert_eq!(math_sub(11), None);
    }
}