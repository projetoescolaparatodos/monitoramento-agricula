# -*- coding: utf-8 -*-
"""
Extrai e consolida os cadastros de produtores das 4 planilhas da SEMAPA
em um JSON único, deduplicado por CPF, pronto para importação no Firestore.

Uso: python scripts/extrair-produtores.py "C:/Users/nalbe/Downloads"
Saída: scripts/data/produtores-import.json
"""
import json
import os
import re
import sys
import unicodedata

import pandas as pd

PLANILHAS = {
    "TRATOR DE PNEU E ESTEIRA.xlsx": "mecanizacao",
    "PISCICULTURA.xlsx": "piscicultura",
    "MUDAS FRUTIFERAS.xlsx": "mudas",
    "PROJETOS AVIARIO, HORTA E SUINOCULTURA.xlsx": "projetos",
}

ATIVIDADE_LABEL = {
    "mecanizacao": "Mecanização (Trator)",
    "piscicultura": "Piscicultura",
    "mudas": "Mudas Frutíferas",
    "projetos": "Projetos (Aviário/Horta/Suinocultura)",
}


def sem_acento(texto):
    if not isinstance(texto, str):
        return ""
    nfkd = unicodedata.normalize("NFKD", texto)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).upper().strip()


def normalizar_cpf(valor):
    if valor is None:
        return ""
    digitos = re.sub(r"\D", "", str(valor))
    # Alguns CPFs vêm como float da planilha ("59266262242.0")
    if digitos.endswith("0") and "." in str(valor) and len(digitos) == 12:
        digitos = digitos[:-1]
    return digitos


def formatar_cpf(digitos):
    if len(digitos) == 11:
        return f"{digitos[0:3]}.{digitos[3:6]}.{digitos[6:9]}-{digitos[9:11]}"
    return digitos


def limpar(valor):
    if valor is None or (isinstance(valor, float) and pd.isna(valor)):
        return ""
    texto = re.sub(r"\s+", " ", str(valor)).strip()
    return "" if texto.lower() == "nan" else texto


def slug(texto):
    base = sem_acento(texto).lower()
    return re.sub(r"[^a-z0-9]+", "-", base).strip("-")[:80]


def extrair_aba(df, arquivo, aba, atividade):
    registros = []
    header_row = None
    col_map = {}

    for idx in range(min(len(df), 15)):
        row = [sem_acento(limpar(v)) for v in df.iloc[idx].tolist()]
        if any("PROPRIET" in c for c in row) and any(c == "CPF" for c in row):
            header_row = idx
            for col_idx, cell in enumerate(row):
                if "PROPRIET" in cell:
                    col_map["nome"] = col_idx
                elif cell == "CPF":
                    col_map["cpf"] = col_idx
                elif "LOCALIDADE" in cell:
                    col_map["localidade"] = col_idx
                elif "TELEFONE" in cell:
                    col_map["telefone"] = col_idx
                elif "SERVICO" in cell:
                    col_map["servico"] = col_idx
            break

    if header_row is None or "nome" not in col_map:
        print(f"  !! Cabecalho nao encontrado em {arquivo} / {aba} - aba ignorada")
        return registros

    for idx in range(header_row + 1, len(df)):
        get = lambda campo: limpar(df.iat[idx, col_map[campo]]) if campo in col_map else ""
        nome = get("nome")
        if not nome or "PROPRIET" in sem_acento(nome):
            continue
        registros.append({
            "nome": nome,
            "cpf": get("cpf"),
            "localidade": get("localidade"),
            "telefone": get("telefone"),
            "servico": get("servico"),
            "atividade": atividade,
            "regiao": aba.strip(),
            "planilha": arquivo,
        })
    return registros


def main():
    pasta = sys.argv[1] if len(sys.argv) > 1 else "."
    linhas = []
    for arquivo, atividade in PLANILHAS.items():
        caminho = os.path.join(pasta, arquivo)
        if not os.path.exists(caminho):
            print(f"!! Arquivo nao encontrado: {caminho}")
            continue
        xl = pd.ExcelFile(caminho)
        for aba in xl.sheet_names:
            df = xl.parse(aba, header=None)
            regs = extrair_aba(df, arquivo, aba, atividade)
            print(f"  {arquivo} / {aba}: {len(regs)} registros")
            linhas.extend(regs)

    print(f"\nTotal de linhas extraidas: {len(linhas)}")

    # Consolidar por CPF (fallback: nome normalizado quando CPF invalido)
    produtores = {}
    cpf_invalidos = 0
    for linha in linhas:
        digitos = normalizar_cpf(linha["cpf"])
        cpf_valido = len(digitos) == 11
        if cpf_valido:
            chave = digitos
        else:
            cpf_invalidos += 1
            chave = "nome-" + slug(linha["nome"])
            if not chave.strip("-"):
                continue

        if chave not in produtores:
            produtores[chave] = {
                "cpfKey": chave,
                "cpf": formatar_cpf(digitos) if cpf_valido else linha["cpf"],
                "cpfValido": cpf_valido,
                "nome": linha["nome"].upper(),
                "telefone": linha["telefone"],
                "localidade": linha["localidade"],
                "regiao": linha["regiao"],
                "origem": "planilha",
                "atividades": [],
            }
        p = produtores[chave]
        # Preencher lacunas com dados de outras linhas do mesmo produtor
        if not p["telefone"] and linha["telefone"]:
            p["telefone"] = linha["telefone"]
        if not p["localidade"] and linha["localidade"]:
            p["localidade"] = linha["localidade"]

        atividade_item = {
            "tipo": linha["atividade"],
            "tipoLabel": ATIVIDADE_LABEL[linha["atividade"]],
            "servico": linha["servico"],
            "regiao": linha["regiao"],
            "localidade": linha["localidade"],
            "planilha": linha["planilha"],
            "origem": "planilha",
        }
        # Evitar duplicata exata (mesmo tipo + servico + regiao)
        ja_existe = any(
            a["tipo"] == atividade_item["tipo"]
            and a["servico"] == atividade_item["servico"]
            and a["regiao"] == atividade_item["regiao"]
            for a in p["atividades"]
        )
        if not ja_existe:
            p["atividades"].append(atividade_item)

    saida = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    os.makedirs(saida, exist_ok=True)
    destino = os.path.join(saida, "produtores-import.json")
    with open(destino, "w", encoding="utf-8") as f:
        json.dump(list(produtores.values()), f, ensure_ascii=False, indent=1)

    print(f"Produtores unicos: {len(produtores)} (linhas com CPF invalido: {cpf_invalidos})")
    resumo = {}
    for p in produtores.values():
        for a in p["atividades"]:
            resumo[a["tipo"]] = resumo.get(a["tipo"], 0) + 1
    print("Atividades por tipo:", resumo)
    print(f"Gerado: {destino}")


if __name__ == "__main__":
    main()
