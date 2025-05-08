export default function TaxTable({ data }: { data: { label: string; amount: number }[] }) {
    return (
      <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Tax Breakdown Summary</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="bg-teal-50">
                <th className="px-3 py-2 text-left font-medium text-teal-700">Category</th>
                <th className="px-3 py-2 text-right font-medium text-teal-700">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((item, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-gray-700">{item.label}</td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    ${item.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            This is an estimated breakdown based on current tax rates. Actual tax liability may vary based
            on additional factors.
          </div>
        </div>
      </div>
    )
  }
  
  