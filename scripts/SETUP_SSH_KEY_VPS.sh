#!/bin/bash
# Script para rodar NO VPS - adiciona chave SSH pública
# Uso: bash /tmp/setup-ssh-key.sh

PUBLIC_KEY="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAOk6KEfDT5VBfLwkkP7PjLhRXV1z9ttSZ+JUbIT7y92 user@hugo"

mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Verificar se chave já existe
if grep -q "$PUBLIC_KEY" ~/.ssh/authorized_keys 2>/dev/null; then
    echo "Chave SSH já configurada."
else
    echo "$PUBLIC_KEY" >> ~/.ssh/authorized_keys
    chmod 600 ~/.ssh/authorized_keys
    echo "Chave SSH configurada com sucesso!"
fi
