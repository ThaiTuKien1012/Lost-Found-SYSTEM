import React from 'react';
import AnimatedBackground from '../../components/common/AnimatedBackground';
import { FiCheckCircle } from 'react-icons/fi';
import ConfirmedMatchesList from '../../components/matching/ConfirmedMatchesList';

const SecurityReadyToReturnPage = () => {
  return (
    <div className="page-container">
      <AnimatedBackground />
      <div className="page-content">
        <div className="page-header-enhanced">
          <div className="title-wrapper">
            <FiCheckCircle className="title-icon" />
            <div>
              <h1 className="page-title">Đồ Sẵn Sàng Trả</h1>
              <p className="page-subtitle">Danh sách đồ vật đã được xác nhận và sẵn sàng trả cho sinh viên</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <ConfirmedMatchesList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityReadyToReturnPage;

