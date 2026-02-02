# Copiar chave SSH pro VPS (sem abrir Bloco de Notas)

Faça no **PowerShell**, um passo de cada vez.

---

## Passo 1 — Ver a chave pública

Digite e Enter:

```powershell
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

Vai aparecer **uma linha** (começa com `ssh-ed25519`). **Selecione essa linha inteira** e copie (Ctrl+C).

---

## Passo 2 — Conectar no VPS

Digite e Enter:

```powershell
ssh root@76.13.113.9
```

Quando pedir **password:**, cole a senha do VPS e Enter.

---

## Passo 3 — No VPS, colar a chave

Você estará conectado no servidor (vai aparecer algo como `root@srv...`).

Digite (sem colar ainda):

```bash
mkdir -p ~/.ssh && echo '
```

**Agora cole a chave** (a linha que você copiou no passo 1).

Depois digite (fechando a aspas):

```bash
' >> ~/.ssh/authorized_keys
```

Ou seja: você digita `mkdir -p ~/.ssh && echo '`, cola a chave, e digita `' >> ~/.ssh/authorized_keys` e Enter.

---

## Passo 4 — Sair do VPS

Digite:

```bash
exit
```

---

## Passo 5 — Testar

Digite:

```powershell
ssh root@76.13.113.9 "echo OK"
```

Se aparecer **OK** e **não** pedir senha, está certo. Aí é só rodar:

```powershell
.\scripts\deploy-tudo.ps1
```
