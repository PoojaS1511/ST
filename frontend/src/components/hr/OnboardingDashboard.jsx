<div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Onboarding Dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={fetchStats} className="px-3 py-2 bg-blue-600 text-white rounded">Refresh</button>
          <button onClick={() => { setCurrentStep(0); setStepStatus({ profile: false, documents: false, policies: false, activated: false }); setCreatedEmployee(null); setDocCount(0); setPolicyCreated({ work: false, leave: false }); }} className="px-3 py-2 bg-gray-100 rounded">Reset</button>
        </div>
      </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"></div>
  return (
    <div className="space-y-6" data-cy="onboarding-dashboard">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Onboarding Dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={fetchStats} className="px-3 py-2 bg-blue-600 text-white rounded" data-cy="refresh-button">Refresh</button>
          <button onClick={() => { setCurrentStep(0); setStepStatus({ profile: false, documents: false, policies: false, activated: false }); setCreatedEmployee(null); setDocCount(0); setPolicyCreated({ work: false, leave: false }); }} className="px-3 py-2 bg-gray-100 rounded" data-cy="reset-button">Reset</button>
        </div>
      </div>
