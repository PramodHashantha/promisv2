import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { appointmentUpdateAPI } from '@/utils/api/appointmentUpdate';
import SearchableDropdown from '@/components/dropdown/SearchableDropdown'

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userInfo, setUserInfo] = useState({
    pfno: '',
    fullname: '',
    appointmentId: 0,
    currentParentAppointment: ''
  });
  const [parentAppointments, setParentAppointments] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState('');

  useEffect(() => {
    loadPageData();
  }, []);

  const parentAppointmentOptions = useMemo(
    () =>
      parentAppointments.map((appointment) => ({
        value: appointment.APPOINTMENT_ID,
        label: appointment.APPANDSECTION ?? ''
      })),
    [parentAppointments]
  );

  const selectedParentOption = useMemo(() => {
    if (selectedParentId === '' || selectedParentId == null) return null;
    return (
      parentAppointmentOptions.find(
        (opt) => opt.value != null && String(opt.value) === String(selectedParentId)
      ) ?? null
    );
  }, [parentAppointmentOptions, selectedParentId]);

  const loadPageData = async () => {
    try {
      setLoading(true);

      console.log('=== Loading AppointmentUpdate Page Data ===');

      // Load current user info
      const userInfoData = await appointmentUpdateAPI.getCurrentUserInfo();
      console.log('User Info Response:', userInfoData);
      
      // Load parent appointments dropdown
      const appointmentsData = await appointmentUpdateAPI.getParentAppointments();
      console.log('Parent Appointments Response:', appointmentsData);

      // Handle both camelCase and PascalCase property names from API
      setUserInfo({
        pfno: userInfoData?.PFNO || '',
        fullname: userInfoData?.FULLNAME ||'',
        appointmentId: userInfoData?.APPOINTMENT_ID || 0,
        currentParentAppointment: userInfoData?.CURRENT_PARENT_APPOINTMENT || 'N/A'
      });

      setParentAppointments(appointmentsData || []);

      console.log('Page data loaded successfully');
      console.log('User Info:', {
        pfno: userInfoData?.PFNO,
        fullname: userInfoData?.FULLNAME ||'',
        appointmentId: userInfoData?.APPOINTMENT_ID || 0,
        currentParentAppointment: userInfoData?.CURRENT_PARENT_APPOINTMENT || 'N/A'
      });
      console.log('Appointments Count:', appointmentsData?.length);
    } catch (error) {
      console.error('Error loading page data:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Load Failed',
        text: error.message || 'Failed to load page data',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedParentId) {
      await Swal.fire({
        icon: 'warning',
        title: 'Selection Required',
        text: 'Please select a new parent appointment',
        confirmButtonColor: '#fbbf24',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      setSaving(true);

      console.log('Saving parent appointment:', {
        appointment_id: userInfo.appointmentId,
        partent_appointment_id: parseInt(selectedParentId)
      });

      await appointmentUpdateAPI.updateParentAppointment({
        APPOINTMENT_ID: userInfo.appointmentId,
        PARTENT_APPOINTMENT_ID: parseInt(selectedParentId)
      });

      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Saved Successfully',
        confirmButtonColor: '#10b981',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true
      });

      // Reload page data to show updated info
      await loadPageData();
      setSelectedParentId('');
    } catch (error) {
      console.error('Error saving:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Save Failed',
        text: error.message || 'Failed to update parent appointment',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <PageHeader>
          {/* <h1 className="page-title">Update Parent Appointment</h1> */}
        </PageHeader>
        <div className="main-content min-h-screen">
          <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center gap-4 px-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-cyan-600" />
            <p className="text-sm font-medium text-gray-600">Loading appointment details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <PageHeader>
        {/* <h1 className="page-title">Update Parent Appointment</h1> */}
      </PageHeader>

      <div className="main-content">
        <h3>Stores Out From Inventory</h3>
        <div className="mx-auto w-full max-w-3xl px-4 py-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-cyan-500 bg-cyan-600 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-semibold text-white sm:text-xl">Select Appointment</h2>
              <p className="mt-1 text-xs text-cyan-100 sm:text-sm">Update your parent appointment using the form below.</p>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">PFNO</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  value={userInfo.pfno || ''}
                  readOnly
                  placeholder="Loading..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  value={userInfo.fullname || ''}
                  readOnly
                  placeholder="Loading..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Current Parent Appointment</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  value={userInfo.currentParentAppointment || 'N/A'}
                  readOnly
                  placeholder="Loading..."
                />
              </div>

              {/* <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">New Parent Appointment</label>
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                >
                  <option value="">-- Select Parent Appointment --</option>
                  {parentAppointments.map((appointment) => (
                    <option 
                      key={appointment.appointment_id || appointment.APPOINTMENT_ID} 
                      value={appointment.appointment_id || appointment.APPOINTMENT_ID}
                    >
                      {appointment.appandsection || appointment.APPANDSECTION}
                    </option>
                  ))}
                </select>
                {parentAppointments.length === 0 && (
                  <small className="mt-1 block text-xs font-medium text-red-500">
                    No parent appointments available
                  </small>
                )}
              </div> */}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">New Parent Appointment</label>
                <SearchableDropdown 
                  options={parentAppointmentOptions}
                  value={selectedParentOption}
                  onChange={(option) => setSelectedParentId(option?.value ?? '')}
                  placeholder="-- Select Parent Appointment --"
                  // noOptionsMessage="No parent appointments available"
                  menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  menuPosition="fixed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  className="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  onClick={handleSave}
                  disabled={saving || !selectedParentId}
                >
                  {saving && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  <span>{saving ? 'Updating...' : 'Update Appointment'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    
    </>
  );
};

export default Index;