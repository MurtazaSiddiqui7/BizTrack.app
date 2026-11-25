import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';

// Views
import { DashboardView } from './views/DashboardView';
import { ShopsView } from './views/ShopsView';
import { DistributionView } from './views/DistributionView';
import { InventoryView } from './views/InventoryView';
import { RoutePlannerView } from './views/RoutePlannerView';
import { InteractiveMapView } from './views/InteractiveMapView';
import { AnalyticsView } from './views/AnalyticsView';
import { MonthlyHistoryView } from './views/MonthlyHistoryView';
import { FinanceView } from './views/FinanceView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

// Modals
import { RecordDeliveryModal } from './components/modals/RecordDeliveryModal';
import { AssignFlavoursModal } from './components/modals/AssignFlavoursModal';
import { AddShopModal } from './components/modals/AddShopModal';
import { AddProductModal } from './components/modals/AddProductModal';
import { StockAdjustModal } from './components/modals/StockAdjustModal';
import { WhatsAppModal } from './components/modals/WhatsAppModal';

import { Shop, ChocolateProduct, ShopDistributionSummary } from './types';

const MainAppContent: React.FC = () => {
  const { activeView, selectedShopForDelivery, setSelectedShopForDelivery } = useApp();

  // Modal states
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [deliveryShop, setDeliveryShop] = useState<Shop | null>(null);

  const [assignShop, setAssignShop] = useState<Shop | null>(null);

  const [addShopOpen, setAddShopOpen] = useState(false);
  const [shopToEdit, setShopToEdit] = useState<Shop | null>(null);

  const [addProductOpen, setAddProductOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ChocolateProduct | null>(null);

  const [stockProduct, setStockProduct] = useState<ChocolateProduct | null>(null);

  const [whatsAppSummary, setWhatsAppSummary] = useState<ShopDistributionSummary | null>(null);

  // When selectedShopForDelivery changes from context
  React.useEffect(() => {
    if (selectedShopForDelivery) {
      setDeliveryShop(selectedShopForDelivery);
      setDeliveryModalOpen(true);
      setSelectedShopForDelivery(null);
    }
  }, [selectedShopForDelivery, setSelectedShopForDelivery]);

  const handleOpenDelivery = (shop?: Shop) => {
    setDeliveryShop(shop || null);
    setDeliveryModalOpen(true);
  };

  const handleOpenAssign = (shop: Shop) => {
    setAssignShop(shop);
  };

  const handleOpenAddShop = () => {
    setShopToEdit(null);
    setAddShopOpen(true);
  };

  const handleEditShop = (shop: Shop) => {
    setShopToEdit(shop);
    setAddShopOpen(true);
  };

  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setAddProductOpen(true);
  };

  const handleEditProduct = (product: ChocolateProduct) => {
    setProductToEdit(product);
    setAddProductOpen(true);
  };

  const handleAdjustStock = (product: ChocolateProduct) => {
    setStockProduct(product);
  };

  const handleOpenWhatsApp = (summary: ShopDistributionSummary) => {
    setWhatsAppSummary(summary);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-20 lg:pb-8 overflow-x-hidden w-full min-w-0">
        {/* Top Header */}
        <Header />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-3 sm:p-5 lg:p-8 w-full min-w-0 overflow-x-hidden">
          {activeView === 'dashboard' && (
            <DashboardView
              onOpenAddShop={handleOpenAddShop}
              onOpenAddProduct={handleOpenAddProduct}
              onOpenRecordDelivery={() => handleOpenDelivery()}
            />
          )}

          {activeView === 'shops' && (
            <ShopsView
              onOpenAddShop={handleOpenAddShop}
              onEditShop={handleEditShop}
              onAssignFlavours={handleOpenAssign}
              onRecordDeliveryForShop={handleOpenDelivery}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {activeView === 'distribution' && (
            <DistributionView
              onRecordDeliveryForShop={handleOpenDelivery}
              onAssignFlavours={handleOpenAssign}
              onOpenWhatsApp={handleOpenWhatsApp}
            />
          )}

          {activeView === 'inventory' && (
            <InventoryView
              onOpenAddProduct={handleOpenAddProduct}
              onEditProduct={handleEditProduct}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {activeView === 'route' && (
            <RoutePlannerView
              onRecordDeliveryForShop={handleOpenDelivery}
            />
          )}

          {activeView === 'map' && (
            <InteractiveMapView
              onRecordDeliveryForShop={handleOpenDelivery}
            />
          )}

          {activeView === 'analytics' && <AnalyticsView />}

          {activeView === 'history' && <MonthlyHistoryView />}

          {activeView === 'finance' && <FinanceView />}

          {activeView === 'reports' && <ReportsView />}

          {activeView === 'settings' && <SettingsView />}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </div>

      {/* Global Interactive Modals */}
      {deliveryModalOpen && (
        <RecordDeliveryModal
          shop={deliveryShop}
          onClose={() => {
            setDeliveryModalOpen(false);
            setDeliveryShop(null);
          }}
        />
      )}

      {assignShop && (
        <AssignFlavoursModal
          shop={assignShop}
          onClose={() => setAssignShop(null)}
        />
      )}

      {addShopOpen && (
        <AddShopModal
          shopToEdit={shopToEdit}
          onClose={() => {
            setAddShopOpen(false);
            setShopToEdit(null);
          }}
        />
      )}

      {addProductOpen && (
        <AddProductModal
          productToEdit={productToEdit}
          onClose={() => {
            setAddProductOpen(false);
            setProductToEdit(null);
          }}
        />
      )}

      {stockProduct && (
        <StockAdjustModal
          product={stockProduct}
          onClose={() => setStockProduct(null)}
        />
      )}

      {whatsAppSummary && (
        <WhatsAppModal
          summary={whatsAppSummary}
          onClose={() => setWhatsAppSummary(null)}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
