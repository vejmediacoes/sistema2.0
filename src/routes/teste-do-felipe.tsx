import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/teste-do-felipe')({
  component: TesteDoFelipe,
})

type ContractType = 'consignado' | 'veicular'

type ContractData = {
  clientName: string
  clientDocument: string
  contractType: ContractType
  institution: string
  contractNumber: string
  contractDate: string
  currentInstallment: string
  originalInstallment: string
  financedAmount: string
  installmentsPaid: string
  totalInstallments: string
  interestRate: string
  vehicle: string
}

const REDUCAO = 0.29

const initialData: ContractData = {
  clientName: '',
  clientDocument: '',
  contractType: 'consignado',
  institution: '',
  contractNumber: '',
  contractDate: '',
  currentInstallment: '',
  originalInstallment: '',
  financedAmount: '',
  installmentsPaid: '',
  totalInstallments: '',
  interestRate: '',
  vehicle: '',
}

function toNumber(value: string) {
  const number = Number(String(value).replace(',', '.'))
  return Number.isFinite(number) ? number : 0
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

function formatDate(date: string) {
  if (!date) return 'não informada'
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('pt-BR')
}

function monthsSince(date: string) {
  if (!date) return 0
  const start = new Date(`${date}T00:00:00`)
  if (Number.isNaN(start.getTime())) return 0
  const today = new Date()
  const months =
    (today.getFullYear() - start.getFullYear()) * 12 + (today.getMonth() - start.getMonth())
  return Math.max(0, months)
}

function TesteDoFelipe() {
  const [data, setData] = useState<ContractData>(initialData)
  const [reportGenerated, setReportGenerated] = useState(false)

  const result = useMemo(() => {
    const current = toNumber(data.currentInstallment)
    const original = toNumber(data.originalInstallment) || current
    const reducedInstallment = current * (1 - REDUCAO)
    const monthlyDifference = Math.max(0, current - reducedInstallment)
    const contractMonths = monthsSince(data.contractDate)
    const informedPaidMonths = toNumber(data.installmentsPaid)
    const retroactiveMonths = informedPaidMonths || contractMonths
    const retroactiveAmount = monthlyDifference * retroactiveMonths
    const totalInstallments = toNumber(data.totalInstallments)
    const remainingInstallments =
      totalInstallments > 0 ? Math.max(0, totalInstallments - informedPaidMonths) : 0
    const futureEconomy = monthlyDifference * remainingInstallments
    const percentageIncrease = original > 0 ? ((current - original) / original) * 100 : 0
    const totalEconomy = retroactiveAmount + futureEconomy

    const irregularities: string[] = []
    if (current > 0 && original > 0 && current > original * 1.29) {
      irregularities.push(
        'A parcela atual está mais de 29% acima do valor originalmente informado, o que indica possível cobrança indevida ou encargos não contratados.',
      )
    }
    if (toNumber(data.interestRate) > 2) {
      irregularities.push(
        'A taxa mensal informada supera 2% ao mês e deve ser confrontada com o contrato e com os parâmetros aplicáveis ao consignado.',
      )
    }
    if (totalInstallments > 0 && informedPaidMonths > totalInstallments) {
      irregularities.push('A quantidade de parcelas pagas é superior ao total de parcelas informado.')
    }
    if (totalInstallments > 0 && informedPaidMonths > 0 && informedPaidMonths < totalInstallments) {
      irregularities.push(
        'Confira se há parcelas em atraso ou descontos acumulados no contracheque, situação comum em contratos renegociados.',
      )
    }
    if (toNumber(data.financedAmount) > 0 && current > 0 && totalInstallments > 0) {
      const totalPago = current * totalInstallments
      if (totalPago > toNumber(data.financedAmount) * 2) {
        irregularities.push(
          'O total a ser pago supera o dobro do valor financiado informado, indicativo de juros e encargos elevados.',
        )
      }
    }
    if (irregularities.length === 0) {
      irregularities.push(
        'Não foram identificados alertas automáticos com os dados preenchidos. A análise documental e contábil continua necessária.',
      )
    }

    return {
      current,
      original,
      reducedInstallment,
      monthlyDifference,
      retroactiveMonths,
      retroactiveAmount,
      futureEconomy,
      remainingInstallments,
      percentageIncrease,
      totalEconomy,
      irregularities,
    }
  }, [data])

  function updateField(field: keyof ContractData, value: string) {
    setData((current) => ({ ...current, [field]: value }))
    setReportGenerated(false)
  }

  function generateReport() {
    setReportGenerated(true)
    window.setTimeout(() => window.print(), 100)
  }

  const contractLabel =
    data.contractType === 'consignado' ? 'Empréstimo consignado' : 'Financiamento veicular'

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl bg-slate-950 p-6 text-white shadow-lg print:rounded-none print:shadow-none">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Teste do Felipe
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Análise de contracheque e contratos
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Simule a redução aproximada de 29% na parcela, calcule os valores retroativos desde a
            contratação, aponte possíveis irregularidades e gere o laudo pericial preliminar.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:border-0 print:p-0 print:shadow-none">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Dados do contrato</h2>
              <p className="mt-1 text-sm text-slate-500">
                Preencha os valores disponíveis no contracheque ou no instrumento contratual.
              </p>
            </div>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              Cálculo estimativo de 29%
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1 text-sm font-medium">
              Nome do cliente
              <input
                value={data.clientName}
                onChange={(event) => updateField('clientName', event.target.value)}
                className="input-field"
                placeholder="Nome completo"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              CPF do cliente
              <input
                value={data.clientDocument}
                onChange={(event) => updateField('clientDocument', event.target.value)}
                className="input-field"
                placeholder="000.000.000-00"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Tipo de contrato
              <select
                value={data.contractType}
                onChange={(event) => updateField('contractType', event.target.value)}
                className="input-field"
              >
                <option value="consignado">Empréstimo consignado</option>
                <option value="veicular">Financiamento veicular</option>
              </select>
            </label>
            <label className="space-y-1 text-sm font-medium">
              Instituição financeira
              <input
                value={data.institution}
                onChange={(event) => updateField('institution', event.target.value)}
                className="input-field"
                placeholder="Banco ou financeira"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Número do contrato
              <input
                value={data.contractNumber}
                onChange={(event) => updateField('contractNumber', event.target.value)}
                className="input-field"
                placeholder="Opcional"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Data da contratação
              <input
                type="date"
                value={data.contractDate}
                onChange={(event) => updateField('contractDate', event.target.value)}
                className="input-field"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Parcela atual (R$)
              <input
                inputMode="decimal"
                value={data.currentInstallment}
                onChange={(event) => updateField('currentInstallment', event.target.value)}
                className="input-field"
                placeholder="0,00"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Parcela original (R$)
              <input
                inputMode="decimal"
                value={data.originalInstallment}
                onChange={(event) => updateField('originalInstallment', event.target.value)}
                className="input-field"
                placeholder="0,00"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Valor financiado (R$)
              <input
                inputMode="decimal"
                value={data.financedAmount}
                onChange={(event) => updateField('financedAmount', event.target.value)}
                className="input-field"
                placeholder="0,00"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Parcelas pagas
              <input
                type="number"
                min="0"
                value={data.installmentsPaid}
                onChange={(event) => updateField('installmentsPaid', event.target.value)}
                className="input-field"
                placeholder="0"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Total de parcelas
              <input
                type="number"
                min="0"
                value={data.totalInstallments}
                onChange={(event) => updateField('totalInstallments', event.target.value)}
                className="input-field"
                placeholder="0"
              />
            </label>
            <label className="space-y-1 text-sm font-medium">
              Taxa mensal informada (%)
              <input
                inputMode="decimal"
                value={data.interestRate}
                onChange={(event) => updateField('interestRate', event.target.value)}
                className="input-field"
                placeholder="0,00"
              />
            </label>
            {data.contractType === 'veicular' && (
              <label className="space-y-1 text-sm font-medium lg:col-span-2">
                Veículo
                <input
                  value={data.vehicle}
                  onChange={(event) => updateField('vehicle', event.target.value)}
                  className="input-field"
                  placeholder="Modelo e placa, se disponíveis"
                />
              </label>
            )}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Parcela recalculada (-29%)', formatCurrency(result.reducedInstallment)],
            ['Redução mensal', formatCurrency(result.monthlyDifference)],
            ['Retroativo estimado', formatCurrency(result.retroactiveAmount)],
            ['Economia futura', formatCurrency(result.futureEconomy)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            ['Meses considerados', `${result.retroactiveMonths}`],
            ['Parcelas restantes', `${result.remainingInstallments}`],
            ['Ganho total estimado', formatCurrency(result.totalEconomy)],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5 text-cyan-900 shadow-sm"
            >
              <p className="text-sm">{label}</p>
              <p className="mt-2 text-xl font-bold">{value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm print:break-before-page print:border-0 print:p-0 print:shadow-none">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">Laudo pericial preliminar</h2>
              <p className="mt-1 text-sm text-slate-500">
                Resultado baseado exclusivamente nos dados informados.
              </p>
            </div>
            <button
              type="button"
              onClick={generateReport}
              className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700 print:hidden"
            >
              Emitir laudo em PDF
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Cliente', data.clientName || 'não informado'],
              ['CPF', data.clientDocument || 'não informado'],
              ['Tipo de contrato', contractLabel],
              ['Instituição', data.institution || 'não informada'],
              ['Contrato nº', data.contractNumber || 'não informado'],
              ['Data da contratação', formatDate(data.contractDate)],
              [
                'Veículo',
                data.contractType === 'veicular' ? data.vehicle || 'não informado' : 'não se aplica',
              ],
              [
                'Variação da parcela',
                `${result.percentageIncrease.toFixed(1).replace('.', ',')}%`,
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-xl bg-slate-50 p-5 text-sm leading-6">
              <p>
                O presente laudo preliminar analisa um contrato de{' '}
                {data.contractType === 'consignado'
                  ? 'empréstimo consignado'
                  : 'financiamento veicular'}
                {data.institution ? ` junto à instituição ${data.institution}` : ''}.
                Considerando uma redução aproximada de 29% sobre a parcela atual, a parcela estimada
                passa a ser {formatCurrency(result.reducedInstallment)}, com diferença mensal de{' '}
                {formatCurrency(result.monthlyDifference)}.
              </p>
              <p className="mt-4">
                Para {result.retroactiveMonths} meses considerados desde a contratação, o valor
                retroativo estimado é de {formatCurrency(result.retroactiveAmount)}. Restam
                aproximadamente {result.remainingInstallments} parcelas conforme os dados
                preenchidos, o que projeta uma economia futura de{' '}
                {formatCurrency(result.futureEconomy)} — totalizando{' '}
                {formatCurrency(result.totalEconomy)}.
              </p>
              <p className="mt-4 text-xs text-slate-500">
                Este documento é uma simulação técnica e não substitui perícia contábil, análise do
                contrato, extratos bancários ou avaliação jurídica.
              </p>
            </div>
            <div>
              <h3 className="font-bold">Possíveis irregularidades e alertas</h3>
              <ul className="mt-3 space-y-3">
                {result.irregularities.map((item) => (
                  <li
                    key={item}
                    className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              {reportGenerated && (
                <p className="mt-4 text-sm font-semibold text-emerald-700">
                  Laudo preparado para impressão e salvamento em PDF.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
      <style>{`.input-field { margin-top: 0.25rem; display: block; width: 100%; border-radius: 0.75rem; border: 1px solid rgb(203 213 225); background: white; padding: 0.7rem 0.85rem; font-size: 0.875rem; outline: none; } .input-field:focus { border-color: rgb(8 145 178); box-shadow: 0 0 0 3px rgb(207 250 254); } @media print { button, header p, .print\\:hidden { display: none !important; } }`}</style>
    </main>
  )
}
