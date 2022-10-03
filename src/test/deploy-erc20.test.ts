import { expect } from 'chai'
import { ethers } from 'hardhat'
import { ERC20ABI } from '../utils/abi/erc20'
import { ImpersonateWallet } from '../utils/impersonateWallet'

describe("Let's deploy an ERC20", function () {
  async function deployContract() {
    // Get the signer
    const signer = await ImpersonateWallet(
      '0xf89d7b9c864f589bbF53a82105107622B35EaA40',
    )
    // Get the factory on the contracts folder & deploy
    const ERC20 = await ethers.getContractFactory('mintERC20', signer)
    const contract = await ERC20.deploy('Test', 'TST')

    return { contract, signer }
  }
  async function connectToContract(
    contractAddress: string,
    abi: any,
    signer: any,
  ) {
    // Get the factory on the contracts folder & deploy
    const contract = new ethers.Contract(contractAddress, abi, signer)
    return contract
  }

  it('Deploy and mint', async function () {
    const { contract, signer } = await deployContract()
    // Test the newly made contract
    await contract.mint('0xf584F8728B874a6a5c7A8d4d387C9aae9172D621', 1000000)
    expect(await contract.name()).to.equal('Test')
    expect((await contract.totalSupply()).toString()).to.be.equal('1000000')
    expect(await contract.owner()).to.equal(signer.address)
    await expect(
      contract.mint(ethers.constants.AddressZero, 1000000),
    ).to.be.revertedWith('ERC20: mint to the zero address')
  })

  it('Connect wallet', async function () {
    // pega o endereço do contrato
    const { contract } = await deployContract()

    const signer = await ImpersonateWallet(
      '0xf89d7b9c864f589bbF53a82105107622B35EaA40',
    )
    const contractToConnect = await connectToContract(
      contract.address,
      ERC20ABI,
      signer,
    )
    expect(contract.address).to.be.equal(contractToConnect.address)
    expect(await contract.decimals()).to.be.equal(
      await contractToConnect.decimals(),
    )
  })
})
