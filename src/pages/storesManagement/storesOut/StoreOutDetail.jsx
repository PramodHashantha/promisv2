import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GetStoreOutDetailsByMrNo, getStoreWarehousesByPFNO, getStoreRackByWidAndItemNumber, getMaterialRequestItemQtyDetails, getStoreRackByRidAndItemNumber, addToCart, deleteFromCart, processStoreOut, getIssueNumbersByRefNo, reprintStoreOut } from "@/utils/api/api";
import { useApi } from "@/hooks/useApi";
import useNotification from "@/hooks/useNotification";
import useConfirmation from "@/hooks/useConfirmation";
import getIcon from "@/utils/getIcon";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import StoreOutDetailSkeleton from "@/components/skeletons/storeOut/StoreOutDetailSkeleton";
import StockIssueSkeleton from "@/components/skeletons/storeOut/StockIssueSkeleton";
import SearchableDropdown from "@/components/shared/SearchableDropdown";
import Swal from "sweetalert2";
import './style.scss';

const StoreOutDetail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { mrNo } = location.state || {}; // Ensure correct casing: mrNo vs MRNO
    const { notify } = useNotification();
    const { confirmAction } = useConfirmation();

    const { data: details, loading, error: detailsError, execute: fetchDetails } = useApi(GetStoreOutDetailsByMrNo, [mrNo], !!mrNo);

    // API Hooks for selection logic
    const { execute: fetchWarehouses } = useApi(getStoreWarehousesByPFNO, [], false);
    const { execute: fetchRacks } = useApi(getStoreRackByWidAndItemNumber, [], false);
    const { execute: fetchBins, loading: loadingBins } = useApi(getStoreRackByRidAndItemNumber, [], false);

    // New hook for item details
    const {
        data: itemQtyDetails,
        execute: fetchItemQtyDetails,
        loading: itemDetailsLoading
    } = useApi(getMaterialRequestItemQtyDetails, [], false);

    const { execute: fetchIssueNumbers } = useApi(getIssueNumbersByRefNo, [], false);

    // --- New UI State ---
    const [selectedRequestItem, setSelectedRequestItem] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [racks, setRacks] = useState([]);
    const [bins, setBins] = useState([]); // List of items in bins
    const [loadingRacks, setLoadingRacks] = useState(false);

    const [selectedWarehouse, setSelectedWarehouse] = useState("");
    const [selectedRack, setSelectedRack] = useState("");
    const [expandedBins, setExpandedBins] = useState({});
    const [allocations, setAllocations] = useState({}); // { [itemId]: amount }
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isIssuing, setIsIssuing] = useState(false);
    // const [itemQtyDetails, setItemQtyDetails] = useState(null); // Managed by hook now

    const stockIssueRef = useRef(null);

    // Custom Dropdown State
    const [warehouseOpen, setWarehouseOpen] = useState(false);
    const [rackOpen, setRackOpen] = useState(false);
    const [isSwitchingItem, setIsSwitchingItem] = useState(false);
    const warehouseDropdownRef = useRef(null);
    const rackDropdownRef = useRef(null);

    // Click Outside Listener
    const [isIssuedCollapsed, setIsIssuedCollapsed] = useState(true);
    const [isCartCollapsed, setIsCartCollapsed] = useState(false);
    const [isReprinting, setIsReprinting] = useState(false);
    const [selectedCarrierAgent, setSelectedCarrierAgent] = useState('');
    const [selectedAccountCode, setSelectedAccountCode] = useState('');
    const [issueNumbers, setIssueNumbers] = useState([]);
    const [selectedIssueNumber, setSelectedIssueNumber] = useState('');

    const cartItems = details?.bucketItems?.filter(item => item.status == 1) || [];
    const issuedItems = details?.bucketItems?.filter(item => item.status != 1) || [];
    const accountAndExpenseCodes = details?.accountAndExpenseCodes || [];
    const carrierAgents = details?.carrierAgents || [];
    const requestedUserPfno = details?.requestedUserDetails?.pfno?.toString() || '';
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (warehouseDropdownRef.current && !warehouseDropdownRef.current.contains(event.target)) {
                setWarehouseOpen(false);
            }
            if (rackDropdownRef.current && !rackDropdownRef.current.contains(event.target)) {
                setRackOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (carrierAgents.length > 0 && requestedUserPfno && !selectedCarrierAgent) {
            setSelectedCarrierAgent(requestedUserPfno);
        }
    }, [carrierAgents, requestedUserPfno, selectedCarrierAgent]);

    useEffect(() => {
        if (issuedItems.length > 0 && mrNo) {
            fetchIssueNumbers(mrNo).then(data => {
                if (data) {
                    setIssueNumbers(data);
                }
            }).catch(err => console.error("Failed to fetch issue numbers", err));
        }
    }, [issuedItems.length, mrNo]);

    useEffect(() => {
        if (accountAndExpenseCodes.length > 0 && !selectedAccountCode) {
            const defaultCostCode = accountAndExpenseCodes[0]?.defaulT_COST_CODE;

            if (defaultCostCode) {
                // Try finding an exact match for the default cost code in our list
                const matchingCode = accountAndExpenseCodes.find(code => code.a_AND_E_CODE === defaultCostCode);

                if (matchingCode) {
                    setSelectedAccountCode(matchingCode.a_AND_E_CODE);
                    return;
                }
            }

            // Fallback to the first item if no default is found/matches
            setSelectedAccountCode(accountAndExpenseCodes[0].a_AND_E_CODE);
        }
    }, [accountAndExpenseCodes, selectedAccountCode]);

    useEffect(() => {
        if (!mrNo) {
            navigate('/storesout');
        }
        if (detailsError) {
            console.error("Failed to fetch store out details:", detailsError);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load details.'
            });
            navigate('/storesout');
        }
    }, [mrNo, detailsError, navigate]);

    const handleBack = () => {
        navigate('/storesout');
    };

    // --- New Logic ---
    const handleSelectItem = async (item) => {
        setIsSwitchingItem(true);
        setSelectedRequestItem(item);
        setAllocations({});
        setSelectedWarehouse("");
        setSelectedRack("");
        setRacks([]);
        setBins([]);
        setExpandedBins({});

        // Scroll to Stock Issue section
        setTimeout(() => {
            stockIssueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);

        try {
            const warehouseData = await fetchWarehouses();
            setWarehouses(warehouseData || []);

            // Fetch Item Qty Details using hook
            if (mrNo && item.iteM_NUMBER) {
                await fetchItemQtyDetails(mrNo, item.iteM_NUMBER);
            }

        } catch (error) {
            console.error("Failed to fetch warehouses or item details:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load data.'
            });
        } finally {
            setIsSwitchingItem(false);
        }
    };

    const handleWarehouseChange = async (e) => {
        const whId = e.target.value;
        setSelectedWarehouse(whId);
        setSelectedRack("");
        setRacks([]);
        setBins([]);
        setAllocations({});

        if (whId && selectedRequestItem) {
            setLoadingRacks(true);
            try {
                // Fetch Racks
                const racksData = await fetchRacks(whId, selectedRequestItem.iteM_NUMBER);
                setRacks(racksData || []);
            } catch (error) {
                console.error("Failed to fetch racks:", error);
                // Optional: Show error toast
            } finally {
                setLoadingRacks(false);
            }
        }
    };

    const handleRackChange = async (e) => {
        const rackId = e.target.value;
        setSelectedRack(rackId);
        setAllocations({});
        setBins([]);

        if (rackId && selectedRequestItem) {
            try {
                const binData = await fetchBins(rackId, selectedRequestItem.iteM_NUMBER);
                setBins(binData || []);
            } catch (error) {
                console.error("Failed to fetch bins:", error);
            }
        }
    };

    const handleAddToCart = async () => {
        const itemsToProcess = [];
        Object.entries(allocations).forEach(([identifier, qty]) => {
            if (parseFloat(qty) > 0) {
                // Find item in bins using ID or identifier
                const item = bins.find(b => (b.id && b.id.toString() === identifier.toString()) || b.reF_NO === identifier);

                if (item) {
                    itemsToProcess.push({
                        StoreDetailsID: item.id,
                        IssueQty: parseFloat(qty),
                        UnitPrice: item.uniT_PRICE || 0,
                        RefNo: mrNo,
                        TrnBy: "" // Handled by backend
                    });
                }
            }
        });

        if (itemsToProcess.length === 0) return;

        setIsAddingToCart(true);
        try {
            await Promise.all(itemsToProcess.map(item => addToCart(item)));

            notify('success', 'Items added to cart successfully!');

            setAllocations({});

            // Refresh Data
            if (fetchDetails) fetchDetails(); // Reload cart/request items

            // Reload Bins if still selected
            if (selectedRack && selectedRequestItem) {
                const binData = await fetchBins(selectedRack, selectedRequestItem.iteM_NUMBER);
                setBins(binData || []);
            }

            // Reload Qty Details
            if (selectedRequestItem && mrNo) {
                await fetchItemQtyDetails(mrNo, selectedRequestItem.iteM_NUMBER);
            }

        } catch (error) {
            console.error("Add to cart error:", error);
            notify('error', 'Failed to add items to cart.');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleDeleteFromCart = async (item) => {
        const isConfirmed = await confirmAction({
            title: "Remove from Cart?",
            text: `Are you sure you want to remove item ${item.iteM_NUMBER}?`,
            confirmButtonText: "Yes, remove it"
        });

        if (!isConfirmed) return;

        try {
            const deleteDto = {
                TRN_ID: item.trN_ID,
                TrnBy: "" // Handled by backend
            };

            await deleteFromCart(deleteDto);
            notify('success', 'Item removed from cart.');

            // Refresh Data
            if (fetchDetails) fetchDetails();

            // Refresh Qty Details for the deleted item ONLY if it is the currently selected item
            if (mrNo && selectedRequestItem && selectedRequestItem.iteM_NUMBER === item.iteM_NUMBER) {
                await fetchItemQtyDetails(mrNo, item.iteM_NUMBER);
            }

        } catch (error) {
            console.error("Delete from cart error:", error);
            notify('error', 'Failed to remove item from cart.');
        }
    };

    const handleProcessStoreOut = async () => {
        if (!cartItems || cartItems.length === 0) {
            notify('warning', 'Cart is empty. Please add items to cart before issuing.');
            return;
        }

        if (!selectedCarrierAgent) {
            notify('warning', 'Please select a Carrier Agent before issuing.');
            return;
        }

        const isConfirmed = await confirmAction({
            title: "Issue and Print?",
            text: "Are you sure you want to issue the items currently in the cart?",
            confirmButtonText: "Yes, Issue Items"
        });

        if (!isConfirmed) return;

        setIsIssuing(true);
        try {
            const payload = {
                MR_NO: mrNo,
                AGENT_PFNO: selectedCarrierAgent || "N/A"
            };

            const response = await processStoreOut(payload);
            notify('success', 'Store out processed successfully!');

            if (response && response.pdfBase64) {
                const pdfData = `data:application/pdf;base64,${response.pdfBase64}`;
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head>
                                <title>Print Preview - ${payload.MR_NO}</title>
                                <style>
                                    body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                                    iframe { width: 100%; height: 100%; border: none; }
                                </style>
                            </head>
                            <body>
                                <iframe src="${pdfData}"></iframe>
                            </body>
                        </html>
                    `);
                    newWindow.document.close();
                } else {
                    notify('warning', 'Please allow pop-ups to view the print document.');
                }
            }

            // Refresh data
            if (fetchDetails) fetchDetails();
            setAllocations({});

            // Optionally clear selected items so progress bars update
            if (mrNo && selectedRequestItem) {
                await fetchItemQtyDetails(mrNo, selectedRequestItem.iteM_NUMBER);
            }

        } catch (error) {
            console.error("Process Store Out error:", error);
            notify('error', error.response?.data?.message || 'Failed to process store out.');
        } finally {
            setIsIssuing(false);
        }
    };

    const handleReprintStoreOut = async () => {
        if (!selectedIssueNumber) {
            notify('warning', 'Please select an issue number to reprint.');
            return;
        }

        setIsReprinting(true);
        try {
            const response = await reprintStoreOut(mrNo, selectedIssueNumber);
            notify('success', 'Reprint processed successfully!');

            if (response && response.pdfBase64) {
                const pdfData = `data:application/pdf;base64,${response.pdfBase64}`;
                const newWindow = window.open();
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head>
                                <title>Reprint Preview - ${mrNo} (${selectedIssueNumber})</title>
                                <style>
                                    body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
                                    iframe { width: 100%; height: 100%; border: none; }
                                </style>
                            </head>
                            <body>
                                <iframe src="${pdfData}"></iframe>
                            </body>
                        </html>
                    `);
                    newWindow.document.close();
                } else {
                    notify('warning', 'Please allow pop-ups to view the print document.');
                }
            }

        } catch (error) {
            console.error("Reprint Store Out error:", error);
            notify('error', error.response?.data?.message || 'Failed to reprint store out.');
        } finally {
            setIsReprinting(false);
        }
    };

    const toggleBin = (binName) => {
        setExpandedBins(prev => ({
            ...prev,
            [binName]: !prev[binName]
        }));
    };

    const toggleAllBins = () => {
        const uniqueBins = [...new Set(bins.map(item => item.biN_CODE || item.binName || `Bin (${item.x + 1}, ${item.y + 1})`))];
        const allOpen = uniqueBins.length > 0 && uniqueBins.every(bin => expandedBins[bin]);

        if (allOpen) {
            setExpandedBins({});
        } else {
            const newState = {};
            uniqueBins.forEach(bin => {
                newState[bin] = true;
            });
            setExpandedBins(newState);
        }
    };

    const handleAllocationChange = (itemId, val, max) => {
        let value = parseFloat(val);
        if (isNaN(value)) value = 0;
        if (value < 0) value = 0;

        if (value > max) value = max;

        setAllocations(prev => ({
            ...prev,
            [itemId]: value
        }));
    };

    // Calculations based on selected item
    const originalRequest = itemQtyDetails?.requesteD_QTY || (selectedRequestItem ? selectedRequestItem.qty : 0);
    const previouslyIssued = itemQtyDetails?.issueD_QTY || 0;
    const bucketQty = itemQtyDetails?.buckeT_QTY || 0;
    const remainingBalance = itemQtyDetails?.remaininG_QTY || 0; // DB calculated remaining

    const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + val, 0);

    // Effective remaining after current allocations
    const effectiveRemaining = remainingBalance - totalAllocated;
    const isOverAllocated = effectiveRemaining < 0;

    // Progress for selected item
    const pctDone = originalRequest > 0 ? (previouslyIssued / originalRequest) * 100 : 0;
    const pctBucket = originalRequest > 0 ? (bucketQty / originalRequest) * 100 : 0;
    const pctCurrent = originalRequest > 0 ? (totalAllocated / originalRequest) * 100 : 0;
    const totalComplete = originalRequest > 0 ? ((previouslyIssued + bucketQty + totalAllocated) / originalRequest) * 100 : 0;

    if (loading) {
        return (
            <>
                <PageHeader />
                <StoreOutDetailSkeleton />
            </>
        );
    }

    const { items: requestedItems, requestedUserDetails, bucketItems } = details || {};

    const carrierDropdownOptions = carrierAgents.map(agent => ({
        id: agent.pfno,
        title: agent.title
    }));

    const accountDropdownOptions = accountAndExpenseCodes.map((code, index) => ({
        id: `${code.a_AND_E_CODE}_${index}`, // Ensure unique ID for React rendering
        actualValue: code.a_AND_E_CODE, // Keep the real value for form submission
        title: code.codE_AND_DEC
    }));

    const issueDropdownOptions = issueNumbers.map((issue) => ({
        id: issue.issuE_NO,
        title: `${issue.issuE_NO} ${issue.issuE_GEN_NUMBER ? `- ${issue.issuE_GEN_NUMBER}` : ''}`
    }));

    return (
        <>
            <PageHeader />
            <div className="container-fluid p-3 p-md-4 store-out-detail" style={{ paddingBottom: '30vh' }}>
                {/* ... (Header and Back Button - unchanged) ... */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
                    <h4 className="mb-0">Store Out Processing</h4>
                    <button className="brand-btn-secondary px-4" onClick={handleBack}>
                        <i className="bi bi-arrow-left me-2"></i>Back to List
                    </button>
                </div>

                {/* Request List and Cart Grid */}
                <div className="row mb-5">
                    {/* Left Column: Request Item List */}
                    <div className="col-lg-6 mb-4 mb-lg-0">
                        <div className="card sod-card shadow-sm h-100">
                            <div className="sod-card-header">
                                <h5 className="card-title fw-bold">Request Item List {requestedUserDetails?.mrno}</h5>
                            </div>
                            <div className="sod-card-body-table p-3">
                                <div className="table-responsive">
                                    <table className="table table-hover sod-table align-middle mb-0">
                                        <thead className="bg-body-secondary text-uppercase small text-muted">
                                            <tr>
                                                <th scope="col" style={{ width: '100px' }} className="text-center">Action</th>
                                                <th scope="col">Item No</th>
                                                <th scope="col">Description</th>
                                                <th scope="col" className="text-end">Req Qty</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requestedItems && requestedItems.length > 0 ? (
                                                requestedItems.map((item, index) => (
                                                    <tr key={index} className={selectedRequestItem?.iteM_NUMBER === item.iteM_NUMBER ? 'sod-table-active' : ''}>
                                                        <td className="text-center">
                                                            <button
                                                                className={`brand-btn-sm px-3 fw-bold text-nowrap ${selectedRequestItem?.iteM_NUMBER === item.iteM_NUMBER ? 'brand-btn-secondary' : 'brand-btn-primary'}`}
                                                                title="Select Item"
                                                                style={{ fontSize: '0.75rem' }}
                                                                onClick={() => handleSelectItem(item)}
                                                                disabled={selectedRequestItem?.iteM_NUMBER === item.iteM_NUMBER}
                                                            >
                                                                {selectedRequestItem?.iteM_NUMBER === item.iteM_NUMBER ? 'Selected' : 'Select'}
                                                            </button>
                                                        </td>
                                                        <td>{item.iteM_NUMBER}</td>
                                                        <td style={{ minWidth: '200px', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                                                            <div className="fw-medium">{item.description}</div>
                                                            <small className="text-muted">{item.umO_NAME}</small>
                                                        </td>
                                                        <td className="text-end fw-bold">{item.qty?.toFixed(2)}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="4" className="text-center py-3 text-muted">No requested items found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Out Item List (Cart) & Issued History */}
                    <div className="col-lg-6 d-flex flex-column gap-4">

                        {/* ================= SECTION 1: CURRENT CART ================= */}
                        <div className="bg-white rounded-3 shadow-sm border border-secondary-subtle">
                            {/* Card Header */}
                            <div
                                className="bg-white border-bottom border-secondary-subtle px-4 py-3 d-flex justify-content-between align-items-center cursor-pointer hover:bg-gray-50 transition-all"
                                onClick={() => setIsCartCollapsed(!isCartCollapsed)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-secondary-subtle text-secondary p-2 rounded-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                        {getIcon('fa-cart-shopping')}
                                    </div>
                                    <div>
                                        <h6 className="m-0 fw-bold text-dark">Current Cart</h6>
                                        <small className="text-secondary">Items pending final issuance</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <span className="badge bg-secondary-subtle text-dark border border-secondary-subtle rounded-pill px-3 py-2">
                                        {cartItems.length} Items
                                    </span>
                                    <div style={{ transform: isCartCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s ease' }}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-secondary">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Collapsible Content */}
                            {!isCartCollapsed && (
                                <>
                                    {/* Cart Table */}
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                                            <thead className="bg-light text-secondary text-uppercase small">
                                                <tr>
                                                    <th className="px-4 py-3 fw-semibold border-bottom-0">Item No</th>
                                                    <th className="px-4 py-3 fw-semibold border-bottom-0">Description</th>
                                                    {/* <th className="px-4 py-3 fw-semibold border-bottom-0 text-center">Issue No</th> */}
                                                    <th className="px-4 py-3 fw-semibold border-bottom-0 text-center">Qty</th>
                                                    {/* <th className="px-4 py-3 fw-semibold border-bottom-0 text-center">Status</th> */}
                                                    <th className="px-4 py-3 fw-semibold border-bottom-0 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="border-top-0">
                                                {cartItems.length > 0 ? (
                                                    cartItems.map((item, index) => (
                                                        <tr key={index}>
                                                            <td className="px-4 py-3 fw-medium text-dark">{item.iteM_NUMBER}</td>
                                                            <td className="px-4 py-3 text-secondary" style={{ minWidth: '180px' }}>{item.description}</td>
                                                            {/* <td className="px-4 py-3 text-center text-muted">{item.issuE_REF || '-'}</td> */}
                                                            <td className="px-4 py-3 text-center fw-bold text-dark">{item.ouT_QTY}</td>
                                                            {/* <td className="px-4 py-3 text-center">
                                                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-2 py-1 small">
                                                                    Pending
                                                                </span>
                                                            </td> */}
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    className="p-1 transition-colors bg-transparent border-0 cursor-pointer text-secondary"
                                                                    title="Delete"
                                                                    onClick={() => handleDeleteFromCart(item)}
                                                                    style={{ textDecoration: 'none' }}
                                                                >
                                                                    {React.cloneElement(getIcon('DeleteOutlineIcon'), {
                                                                        sx: {
                                                                            transition: 'all 0.2s',
                                                                            '&:hover': {
                                                                                color: '#dc3545', // Danger red
                                                                                transform: 'scale(1.2)',
                                                                            }
                                                                        }
                                                                    })}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-4 text-muted">
                                                            Current cart is empty.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {cartItems.length > 0 && (
                                        <div className="bg-light border-top border-secondary-subtle px-4 py-3 d-flex flex-column gap-3">
                                            <div className="w-100 flex-fill">
                                                <label htmlFor="carrier-agent-trigger" className="form-label small text-muted fw-bold mb-1">Carrier Agent</label>
                                                <SearchableDropdown
                                                    id="carrier-agent"
                                                    options={carrierDropdownOptions}
                                                    value={selectedCarrierAgent}
                                                    onChange={setSelectedCarrierAgent}
                                                    placeholder="Select Agent"
                                                />
                                            </div>

                                            <div className="w-100 flex-fill">
                                                <label htmlFor="account-code-trigger" className="form-label small text-muted fw-bold mb-1">Account & Expense Code</label>
                                                <SearchableDropdown
                                                    id="account-code"
                                                    options={accountDropdownOptions}
                                                    value={selectedAccountCode}
                                                    onChange={setSelectedAccountCode}
                                                    placeholder="Select Account Code"
                                                />
                                            </div>

                                            <div className="w-100 mt-2">
                                                <button
                                                    className="brand-btn-primary d-flex align-items-center gap-2 px-4 shadow-sm w-100 justify-content-center border-0 text-white rounded-3"
                                                    style={{ height: '44px', backgroundColor: '#3b82f6' }}
                                                    onClick={handleProcessStoreOut}
                                                    disabled={cartItems.length === 0 || isIssuing}
                                                >
                                                    {isIssuing ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Issuing & Printing...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {getIcon('fa-print')}
                                                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Issue & Print</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* ================= SECTION 2: ISSUED ITEMS (COLLAPSIBLE) ================= */}
                        <div className="bg-white rounded-3 shadow-sm border border-secondary-subtle">
                            {/* Clickable Header */}
                            <div
                                className="bg-white px-4 py-3 d-flex justify-content-between align-items-center cursor-pointer hover:bg-gray-50 transition-all"
                                onClick={() => setIsIssuedCollapsed(!isIssuedCollapsed)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex align-items-center gap-3">
                                    <div className="bg-success-subtle text-success p-2 rounded-2 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                        {getIcon('fa-clipboard-check')}
                                    </div>
                                    <div>
                                        <h6 className="m-0 fw-bold text-dark">Issued Items History</h6>
                                        <small className="text-secondary">Click to view previously issued items</small>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center gap-3">
                                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-2">
                                        {issuedItems.length} Records
                                    </span>
                                    <div style={{ transform: isIssuedCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s ease' }}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="text-secondary">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Collapsible Content */}
                            {!isIssuedCollapsed && (
                                <div className="border-top border-secondary-subtle">
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                                            <thead className="bg-light text-secondary text-uppercase small">
                                                <tr>
                                                    <th className="px-4 py-3 fw-semibold border-bottom-0">Item No</th>
                                                    <th className="px-4 py-3 fw-semibold border-bottom-0">Description</th>
                                                    <th className="px-4 py-3 fw-semibold border-bottom-0">Qty</th>
                                                    <th className="px-4 py-3 fw-semibold border-bottom-0 text-center">Issue No</th>
                                                    {/* <th className="px-4 py-3 fw-semibold border-bottom-0 text-center">Issued On</th> */}
                                                    {/* <th className="px-4 py-3 fw-semibold border-bottom-0 text-center">Status</th> */}
                                                </tr>
                                            </thead>
                                            <tbody className="border-top-0">
                                                {issuedItems.length > 0 ? (
                                                    issuedItems.map((item, index) => (
                                                        <tr key={index} className="opacity-75">
                                                            <td className="px-4 py-3 fw-medium text-dark">{item.iteM_NUMBER}</td>
                                                            <td className="px-4 py-3 text-secondary" style={{ minWidth: '180px' }}>{item.description}</td>
                                                            <td className="px-4 py-3 text-center fw-bold text-dark">{item.ouT_QTY}</td>
                                                            <td className="px-4 py-3 text-center text-muted">{item.issuE_NO|| '-'}. {item.issuE_GEN_NUMBER ||'-'}</td>
                                                            {/* <td className="px-4 py-3 text-center text-secondary">{new Date(item.createD_DATE).toLocaleDateString()}</td> */}
                                                            {/* <td className="px-4 py-3 text-center">
                                                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small">
                                                                    Completed
                                                                </span>
                                                            </td> */}
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="text-center py-4 text-muted">
                                                            No issued history found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {issuedItems.length > 0 && (
                                        <div className="bg-light border-top border-secondary-subtle px-4 py-3 d-flex flex-column gap-3">
                                            <div className="w-100 flex-fill">
                                                <label htmlFor="reprint-issue-number" className="form-label small text-muted fw-bold mb-1">Select Issue Number</label>
                                                <SearchableDropdown
                                                    id="reprint-issue-number"
                                                    options={issueDropdownOptions}
                                                    value={selectedIssueNumber}
                                                    onChange={setSelectedIssueNumber}
                                                    placeholder="Select Issue Number"
                                                />
                                            </div>

                                            <div className="w-100 mt-2">
                                                <button
                                                    className="brand-btn-secondary d-flex align-items-center gap-2 px-4 shadow-sm w-100 justify-content-center border-0 text-white rounded-3"
                                                    style={{ height: '44px' }}
                                                    onClick={handleReprintStoreOut}
                                                    disabled={isReprinting || !selectedIssueNumber}
                                                >
                                                    {isReprinting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Reprinting...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {getIcon('fa-print')}
                                                            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Reprint</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- STOCK ISSUE UI --- */}
                <div className="row" ref={stockIssueRef}>
                    <div className="col-12">
                        <div className="card sod-card shadow-sm" style={{ minHeight: '400px' }}>
                            {itemDetailsLoading || isSwitchingItem ? (
                                <StockIssueSkeleton />
                            ) : selectedRequestItem ? (
                                <>
                                    {/* Responsive Header for Dark Mode */}
                                    <div className="sod-card-header">
                                        <h5 className="mb-3 fw-bold text-body">Stock Issue</h5>
                                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
                                            <div className="pe-3 mb-2 mb-md-0">
                                                <p className="mb-0 fw-medium text-body fs-6">
                                                    {selectedRequestItem.description}
                                                    <span className="text-muted ms-2 fs-6 fw-normal">({selectedRequestItem.iteM_NUMBER})</span>
                                                </p>
                                            </div>
                                            <div className="px-3 py-2 rounded-pill bg-body-secondary border text-body fw-bold text-nowrap align-self-end align-self-md-auto">
                                                REQ: {originalRequest.toFixed(2)} {selectedRequestItem.umO_NAME}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="sod-card-body p-4">
                                        <div className="row g-4">
                                            {/* Left Sidebar */}
                                            <div className="col-lg-3">
                                                <div className="sod-sidebar">
                                                    <div className="mb-3">
                                                        <label className="form-label small text-muted fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Warehouse</label>
                                                        <div className="position-relative" ref={warehouseDropdownRef}>
                                                            <div className="form-select sod-select d-flex align-items-center justify-content-between"
                                                                onClick={() => setWarehouseOpen(!warehouseOpen)}
                                                                style={{ cursor: 'pointer' }}>
                                                                <span className="text-truncate me-2">
                                                                    {warehouses.find(w => w.w_ID == selectedWarehouse)?.codeanddescription || "Select Warehouse..."}
                                                                </span>
                                                                <i className="bi bi-chevron-down" style={{ transform: warehouseOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.8rem' }}></i>
                                                            </div>
                                                            {warehouseOpen && (
                                                                <div className="sod-dropdown-menu position-absolute w-100 mt-1 shadow-sm">
                                                                    <div className="list-group list-group-flush">
                                                                        <div className="list-group-item" onClick={() => { handleWarehouseChange({ target: { value: "" } }); setWarehouseOpen(false); }}>Select Warehouse...</div>
                                                                        {warehouses.map(w => (
                                                                            <div key={w.w_ID}
                                                                                className={`list-group-item ${selectedWarehouse == w.w_ID ? 'active-item' : ''}`}
                                                                                onClick={() => { handleWarehouseChange({ target: { value: w.w_ID } }); setWarehouseOpen(false); }}>
                                                                                {w.codeanddescription}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="form-label small text-muted fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>Rack</label>
                                                        <div className="position-relative" ref={rackDropdownRef}>
                                                            <div className={`form-select sod-select d-flex align-items-center justify-content-between ${!selectedWarehouse || loadingRacks || (selectedWarehouse && racks.length === 0) ? 'disabled' : ''}`}
                                                                onClick={() => selectedWarehouse && !loadingRacks && racks.length > 0 && setRackOpen(!rackOpen)}
                                                                style={{ cursor: selectedWarehouse && !loadingRacks && racks.length > 0 ? 'pointer' : 'not-allowed', opacity: selectedWarehouse && !loadingRacks && racks.length > 0 ? 1 : 0.7, minHeight: '38px' }}>
                                                                <span className="text-truncate me-2 w-100">
                                                                    {loadingRacks ? (
                                                                        <span className="placeholder-glow w-100 d-block">
                                                                            <span className="placeholder col-12 bg-secondary opacity-25 rounded" style={{ height: '24px' }}></span>
                                                                        </span>
                                                                    ) : selectedWarehouse && racks.length === 0 ? (
                                                                        <span className="text-muted fst-italic">No Racks Found</span>
                                                                    ) : (
                                                                        racks.find(r => r.r_ID == selectedRack)?.rackname || "Select Rack..."
                                                                    )}
                                                                </span>
                                                                {!loadingRacks && racks.length > 0 && (
                                                                    <i className="bi bi-chevron-down" style={{ transform: rackOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '0.8rem' }}></i>
                                                                )}
                                                            </div>
                                                            {rackOpen && (
                                                                <div className="sod-dropdown-menu position-absolute w-100 mt-1 shadow-sm">
                                                                    <div className="list-group list-group-flush">
                                                                        <div className="list-group-item" onClick={() => { handleRackChange({ target: { value: "" } }); setRackOpen(false); }}>Select Rack...</div>
                                                                        {racks.map(r => (
                                                                            <div key={r.r_ID}
                                                                                className={`list-group-item ${selectedRack == r.r_ID ? 'active-item' : ''}`}
                                                                                onClick={() => { handleRackChange({ target: { value: r.r_ID } }); setRackOpen(false); }}>
                                                                                {r.rackname}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Progress Section */}
                                                    <div className="sod-progress">
                                                        <div className="d-flex justify-content-between small sod-progress-label mb-2">
                                                            <span>Issue Progress</span>
                                                            <span className="sod-progress-value">{Math.min(totalComplete, 100).toFixed(0)}%</span>
                                                        </div>
                                                        <div className="progress" style={{ height: '12px', background: '#e5e7eb' }}>
                                                            <div className="progress-bar bg-success" role="progressbar" title="Issued" style={{ width: `${pctDone}% ` }}></div>
                                                            <div className="progress-bar bg-warning" role="progressbar" title="Allocated" style={{ width: `${pctBucket}% ` }}></div>
                                                            <div className="progress-bar sod-bg-brand" role="progressbar" title="Current" style={{ width: `${pctCurrent}% ` }}></div>
                                                        </div>

                                                        <ul className="list-unstyled mt-3 small">
                                                            <li className="d-flex justify-content-between mb-2">
                                                                <span className="text-muted">Original Request</span>
                                                                <span className="fw-bold">{originalRequest.toFixed(2)}</span>
                                                            </li>
                                                            <li className="d-flex justify-content-between mb-2">
                                                                <span className="text-muted">Previously Issued</span>
                                                                <span className="fw-bold">{previouslyIssued.toFixed(2)}</span>
                                                            </li>
                                                            <li className="d-flex justify-content-between mb-2">
                                                                <span className="text-muted">Allocated Qty</span>
                                                                <span className="fw-bold text-warning">{bucketQty.toFixed(2)}</span>
                                                            </li>
                                                            <li className="d-flex justify-content-between mb-2 align-items-center">
                                                                <span className="text-muted">Remaining Balance</span>
                                                                {isOverAllocated ? (
                                                                    <span className="fw-bold text-danger">-{Math.abs(effectiveRemaining).toFixed(2)} (Over)</span>
                                                                ) : (
                                                                    <span className="fw-bold fs-6 sod-text-brand">{effectiveRemaining.toFixed(2)}</span>
                                                                )}
                                                            </li>
                                                            <li className="d-flex justify-content-between pt-3 mt-3 border-top">
                                                                <span className="text-muted">Allocating Now</span>
                                                                <span className="fw-bold fs-6">{totalAllocated.toFixed(2)}</span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Content */}
                                            <div className="col-lg-9">
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h5 className="fw-bold mb-0 text-body">Bin Inventory</h5>
                                                    <button className="p-1 bg-transparent border-0 cursor-pointer text-decoration-none fw-bold small sod-text-brand" onClick={toggleAllBins}>
                                                        Expand / Collapse All
                                                    </button>
                                                </div>

                                                <div className="row g-3">
                                                    {loadingBins ? (
                                                        <div className="col-12 py-5 text-center">
                                                            <div className="spinner-border text-primary" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                            <p className="mt-2 text-muted small">Loading Bin Details...</p>
                                                        </div>
                                                    ) : selectedRack && selectedWarehouse ? (
                                                        bins && bins.length > 0 ? (
                                                            Object.entries(bins.reduce((acc, item) => {
                                                                const binCode = item.biN_CODE || item.binName || `Bin (${item.x + 1}, ${item.y + 1})`;
                                                                if (!acc[binCode]) acc[binCode] = [];
                                                                acc[binCode].push(item);
                                                                return acc;
                                                            }, {})).map(([bin, items]) => {
                                                                const totalAvailableQty = items.reduce((sum, i) => sum + (i.availablE_QTY || 0), 0);
                                                                const isEmpty = items.length === 0;
                                                                const isExpanded = expandedBins[bin];
                                                                const { x, y } = items[0] || {};

                                                                return (
                                                                    <div key={bin} className="col-12">
                                                                        <div className={`card sod-inventory-card h-100 ${isExpanded ? 'expanded' : ''} shadow-sm`}
                                                                            style={{ transition: 'all 0.2s' }}>

                                                                            {/* Bin Header */}
                                                                            <div className="sod-card-header d-flex justify-content-between align-items-center py-3"
                                                                                style={{ cursor: 'pointer', borderBottomWidth: isExpanded ? '2px' : '1px' }}
                                                                                onClick={() => toggleBin(bin)}>
                                                                                <div>
                                                                                    <div className="fw-bold d-flex align-items-center gap-2">
                                                                                        <i className="bi bi-box text-secondary"></i> {bin}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-end lh-1">
                                                                                    <div className="text-uppercase text-muted" style={{ fontSize: '0.65rem', fontWeight: 700 }}>Total Avail</div>
                                                                                    <div className={`fw - bold ${isEmpty ? 'text-muted' : 'text-success'} `}>
                                                                                        {isEmpty ? 'Empty' : `${totalAvailableQty.toFixed(2)} `}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Bin Body (Collapsible) */}
                                                                            {isExpanded && !isEmpty && (
                                                                                <div className="sod-card-body p-3 sod-card-body-table">
                                                                                    <div className="table-responsive">
                                                                                        <table className="table table-sm table-hover mb-0 small text-nowrap">
                                                                                            <thead className="bg-light">
                                                                                                <tr>
                                                                                                    <th className="ps-3 border-0">Item No</th>
                                                                                                    <th className="border-0">GRN No</th>
                                                                                                    <th className="text-end border-0" title="Unit Price">Price</th>
                                                                                                    <th className="text-end border-0" title="Reserved Quantity">Resv.</th>
                                                                                                    <th className="text-end border-0" title="Total Available Quantity (Including Reserved)">Avail Qty</th>
                                                                                                    <th className="text-end border-0" title="Available for Issue">Issue Avail</th>
                                                                                                    <th className="text-end pe-3 border-0" style={{ width: '80px' }}>Issue</th>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                {items.map((item, idx) => {
                                                                                                    // Field Mapping based on API response
                                                                                                    const availableForIssue = item.availablE_FOR_ISSUE_QTY || 0;
                                                                                                    const reservedQty = item.reserveD_QTY_SUM || 0;
                                                                                                    const totalAvail = item.availablE_QTY || (availableForIssue + reservedQty);
                                                                                                    const grnNo = item.reF_NO || '-';
                                                                                                    const date = item.grN_DATE || item.trN_DATE;
                                                                                                    const itemNumber = item.iteM_NUMBER || '-';
                                                                                                    const unitPrice = item.uniT_PRICE || 0;

                                                                                                    // Use ID for key if available, otherwise index
                                                                                                    const rowKey = item.id || idx;

                                                                                                    return (
                                                                                                        <tr key={rowKey} className={idx === 0 ? '' : ''}>
                                                                                                            <td className="ps-3 border-bottom-0 align-middle">
                                                                                                                <div className="fw-bold text-body" style={{ fontSize: '0.8rem' }}>{itemNumber}</div>
                                                                                                            </td>
                                                                                                            <td className="border-bottom-0 align-middle">
                                                                                                                <div className="fw-bold text-body" style={{ fontSize: '0.8rem' }}>{grnNo}</div>
                                                                                                                {date && (
                                                                                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                                                                        {new Date(date).toLocaleDateString()}
                                                                                                                    </div>
                                                                                                                )}
                                                                                                            </td>
                                                                                                            <td className="text-end border-bottom-0 align-middle text-muted">
                                                                                                                {unitPrice.toFixed(2)}
                                                                                                            </td>
                                                                                                            <td className="text-end border-bottom-0 align-middle text-warning fw-semibold">
                                                                                                                {reservedQty > 0 ? reservedQty.toFixed(2) : '-'}
                                                                                                            </td>
                                                                                                            <td className="text-end border-bottom-0 align-middle text-muted">
                                                                                                                {totalAvail.toFixed(2)}
                                                                                                            </td>
                                                                                                            <td className="text-end border-bottom-0 align-middle fw-bold text-success">
                                                                                                                {availableForIssue.toFixed(2)}
                                                                                                            </td>
                                                                                                            <td className="text-end pe-3 border-bottom-0 align-middle">
                                                                                                                <input
                                                                                                                    type="number"
                                                                                                                    className="form-control form-control-sm text-end fw-bold p-1"
                                                                                                                    placeholder="0"
                                                                                                                    min="0"
                                                                                                                    max={availableForIssue}
                                                                                                                    value={allocations[item.id || grnNo] || ''}
                                                                                                                    onChange={(e) => handleAllocationChange(item.id || grnNo, e.target.value, availableForIssue)}
                                                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                                                    style={{ width: '70px', display: 'inline-block' }}
                                                                                                                    disabled={availableForIssue <= 0}
                                                                                                                />
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    );
                                                                                                })}
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {isExpanded && isEmpty && (
                                                                                <div className="sod-card-body text-center text-muted p-4 small">
                                                                                    No stock available in this bin.
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="col-12 text-center py-5 text-muted border border-dashed rounded-3" style={{ borderStyle: 'dashed' }}>
                                                                No bins found for this rack.
                                                            </div>
                                                        )
                                                    ) : (
                                                        <div className="col-12 text-center py-5 text-muted border border-dashed rounded-3" style={{ borderStyle: 'dashed' }}>
                                                            {selectedWarehouse ? 'Select a Rack to view bin details.' : 'Select a Warehouse to proceed.'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="sod-card-footer p-4 d-flex justify-content-end align-items-center gap-4">
                                        <div className="text-end">
                                            <div className="text-muted small">Total to Issue in this Session</div>
                                            <div className={`fs-3 fw-bold lh-1 ${isOverAllocated ? 'text-danger' : 'sod-text-brand'}`}>
                                                {totalAllocated.toFixed(2)}
                                            </div>
                                            {isOverAllocated && (
                                                <div className="text-danger fw-bold small mt-1">
                                                    <i className="bi bi-exclamation-triangle-fill me-1"></i> Exceeds Balance
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className="brand-btn-primary sod-btn-brand px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
                                            disabled={totalAllocated <= 0 || isOverAllocated || isAddingToCart}
                                            onClick={handleAddToCart}
                                        >
                                            {isAddingToCart ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-cart-plus mb-0"></i> Add to Cart
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted p-5">
                                    <i className="bi bi-arrow-up-circle fs-1 mb-3 text-secondary opacity-50"></i>
                                    <h5>Select an item from the request list above</h5>
                                    <p className="small">The stock issue details will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default StoreOutDetail;
