# EcoTide - Local Sustainability Projects Platform

A decentralized application for connecting local communities and organizing sustainability projects built on Stacks blockchain.

## Features
- Create sustainability projects
- Join existing projects as participant 
- Track project metrics and impact
- Reward participants with ecosystem tokens
- Community voting on project proposals

## Setup and Installation
1. Clone the repository
2. Install Clarinet (`curl -L https://install.clarinet.sh | sh`)
3. Run `clarinet check` to verify contracts
4. Run `clarinet test` to execute test suite

## Usage Examples
```clarity
;; Create a new project
(contract-call? .ecotide create-project 
  "Beach Cleanup" 
  "Monthly beach cleanup initiative"
  u10 ;; max participants
  u1000 ;; reward pool
)

;; Join a project
(contract-call? .ecotide join-project u1)

;; Complete project and distribute rewards
(contract-call? .ecotide complete-project u1)

;; Check project details
(contract-call? .ecotide get-project-details u1)
```

## Dependencies
- Clarity language
- Clarinet for development and testing
