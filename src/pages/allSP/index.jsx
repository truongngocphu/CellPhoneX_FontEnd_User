import { useLocation, useNavigate } from 'react-router-dom'
import './css.scss'
import BodyProduct from '../../components/BodyProduct/BodyProduct'
import { Button, Checkbox, Col, Form, InputNumber, Row } from 'antd'
import { FiSearch } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchListHangSX } from '../../redux/HangSX/hangSXSlice';
import { fetchListCategory } from '../../redux/TheLoai/theLoaiSlice';
import { fetchAllProduct } from '../../services/productAPI';
import { GrPowerReset } from "react-icons/gr";

const AllProduct = () => {

    const navigate = useNavigate()
    const [formLocGia] = Form.useForm()
    const dispatch = useDispatch()
    const dataTheLoai = useSelector(state => state.category.listCategorys.data)
    const dataHangSX = useSelector(state => state.hangSX.listHangSXs.data)

    const [dataListSP, setDataListSP] = useState([])
    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(15)
    const [total, setTotal] = useState(0)

    const [tuSelected, setTuSelected] = useState('');
    const [denSelected, setDenSelected] = useState('');
    const [categorySelected, setCategorySelected] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [hangSXSelected, setHangSXSelected] = useState([]);
    const [selectedHangSXs, setSelectedHangSXs] = useState([]);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    let tenSearch = queryParams.get('TenSP')
    console.log("tensp all pro: ", tenSearch);


    const fetchListSP = async () => {
        let query = `page=${current}&limit=${pageSize}`

        if (tenSearch) {
            query += `&TenSP=${encodeURIComponent(tenSearch)}`;
        }
        // Nếu selectedLoaiSP là mảng, chuyển nó thành chuỗi query
        if (tuSelected) {
            query += `&tu=${tuSelected}`;
        }
        if (denSelected) {
            query += `&den=${denSelected}`;
        }
        // Nếu selectedLoaiSP là mảng, chuyển nó thành chuỗi query
        if (categorySelected && categorySelected.length > 0) {
            query += `&locTheoLoai=${encodeURIComponent(JSON.stringify(categorySelected))}`;
        }
        if (hangSXSelected && hangSXSelected.length > 0) {
            query += `&locTheoHangSX=${encodeURIComponent(JSON.stringify(hangSXSelected))}`;
        }
        // if (sortQuery) {
        //     query += `&${sortQuery}`;
        // } 
        // // Thêm tham số order nếu có
        // if (orderQuery) {
        //     query += `&${orderQuery}`;
        // }

        const res = await fetchAllProduct(query)
        console.log("res TL: ", res);
        if (res && res.data) {
            setDataListSP(res.data)
            setTotal(res.totalSanPham)
        }
    }
    console.log("all sp: ", dataListSP);

    useEffect(() => {
        if (tuSelected !== '' && denSelected !== '') {
            fetchListSP(); // Gọi lại hàm fetch khi selectedLoaiSP thay đổi
        } else {
            fetchListSP(); // Nếu không có thể loại nào được chọn, fill lại giá trị bandđầu
        }
    }, [tuSelected, denSelected]); // Lắng nghe sự thay đổi của selectedLoaiSP

    useEffect(() => {
        if (categorySelected && categorySelected.length > 0) {
            fetchListSP();
        } else {
            fetchListSP();
        }
    }, [categorySelected]);

    useEffect(() => {
        if (hangSXSelected && hangSXSelected.length > 0) {
            fetchListSP();
        } else {
            fetchListSP();
        }
    }, [hangSXSelected]);


    useEffect(() => {
        fetchListSP()
    }, [tenSearch, current, pageSize])

    useEffect(() => {
        dispatch(fetchListHangSX())
        dispatch(fetchListCategory())
    }, [dispatch])


    const plainOptions = dataTheLoai?.map((item, index) => ({
        label: item.TenLoaiSP,
        value: item._id
    }))

    const plainOptionThuongHieu = dataHangSX?.map((item, index) => ({
        label: item.TenHangSX,
        value: item._id
    }))

    const onFinishLocGia = (values) => {
        console.log('onFinishLocGia:', values);

        setTuSelected(values.tu)
        setDenSelected(values.den)
    };

    const onChangeCategory = (values) => {
        console.log('id category:', values);
        setCategorySelected(values)
        setSelectedCategories(values)
    };

    const onChangeHangSX = (values) => {
        console.log('id HangSX:', values);
        setHangSXSelected(values)
        setSelectedHangSXs(values)
    };
    console.log(' HangSX:', hangSXSelected);

    const cancelSelected = () => {
        formLocGia.resetFields()
        setTuSelected('')
        setDenSelected('')

        setCategorySelected([])
        setSelectedCategories([])

        setHangSXSelected([])
        setSelectedHangSXs([])
    };


    return (
        <>
            {/* rts navigation bar area start */}
            <div className="rts-navigation-area-breadcrumb">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="navigator-breadcrumb-wrapper">
                                <a onClick={() => navigate('/')}>Home</a>
                                <i className="fa-regular fa-chevron-right" />
                                <a className="current" >Trang sản phẩm</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* rts navigation bar area end */}
            <div className="section-seperator">
                <div className="container">
                    <hr className="section-seperator" />
                </div>
            </div>

            {/* shop[ grid sidebar wrapper */}
            <div className="shop-grid-sidebar-area rts-section-gap bg-light">
  <div className="container">
    <div className="row g-0">
      {/* Sidebar lọc sản phẩm */}
      <div className="col-xl-3 col-lg-12 pr--70 pr_lg--10 pr_sm--10 pr_md--5 rts-sticky-column-item">
        <div className="sidebar-filter-main theiaStickySidebar p-4 bg-white shadow-sm rounded">
          {/* Lọc theo giá */}
          <div className="single-filter-box mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="title fw-bold text-dark">Lọc theo giá</h5>
              <Button
                onClick={cancelSelected}
                icon={<GrPowerReset size={20} />}
                style={{ color: "#ff9800", border: "none" }}
                title="Đặt lại"
              />
            </div>
            <div className="filterbox-body">
              <Form form={formLocGia} onFinish={onFinishLocGia} layout="vertical">
                <Row gutter={[15, 10]}>
                  <Col span={12}>
                    <Form.Item label="Từ giá" name="tu">
                      <InputNumber
                        min={0}
                        placeholder="đ TỪ"
                        style={{ width: "100%", borderRadius: "6px" }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Đến giá" name="den">
                      <InputNumber
                        min={0}
                        placeholder="đ ĐẾN"
                        style={{ width: "100%", borderRadius: "6px" }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24} className="text-center">
                    <Button
                      onClick={() => formLocGia.submit()}
                      icon={<FiSearch />}
                      type="primary"
                      style={{ width: "120px", borderRadius: "6px" }}
                    >
                      Áp dụng
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>

          {/* Lọc theo loại sản phẩm */}
          <div className="single-filter-box mb-4">
            <h5 className="title fw-bold text-dark mb-3">Lọc theo loại sản phẩm</h5>
            <div className="filterbox-body">
              <Checkbox.Group onChange={onChangeCategory} value={selectedCategories}>
                <Row>
                  {plainOptions.map((item, index) => (
                    <Col span={24} key={`index-${index}`} className="mb-2">
                      <Checkbox value={item.value} className="modern-checkbox">
                        {item.label}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </div>
          </div>

          {/* Lọc theo thương hiệu */}
          <div className="single-filter-box">
            <h5 className="title fw-bold text-dark mb-3">Lọc theo thương hiệu</h5>
            <div className="filterbox-body">
              <Checkbox.Group onChange={onChangeHangSX} value={selectedHangSXs}>
                <Row>
                  {plainOptionThuongHieu.map((item, index) => (
                    <Col span={24} key={`index-${index}`} className="mb-2">
                      <Checkbox value={item.value} className="modern-checkbox">
                        {item.label}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung sản phẩm */}
      <div className="col-xl-9 col-lg-12 pl--20 pl_md--5 pl_sm--5">
        <div className="product-list-area">
          <div className="filter-header mb-4 d-flex justify-content-between align-items-center">
            <h3 className="title fw-bold text-dark">Danh sách sản phẩm</h3>
            <Select
              defaultValue="default"
              style={{ width: 200, borderRadius: "6px" }}
              onChange={(value) => console.log(value)} // Thay bằng logic sắp xếp thực tế
              options={[
                { value: "default", label: "Mặc định" },
                { value: "price-asc", label: "Giá: Thấp đến cao" },
                { value: "price-desc", label: "Giá: Cao đến thấp" },
                { value: "name-asc", label: "Tên: A-Z" },
              ]}
            />
          </div>

          {/* Danh sách sản phẩm */}
          <div className="row g-4">
            {dataListSP?.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p style={{ color: "#ff4d4f", fontSize: "1.5rem" }}>
                  <IoWarningOutline size={80} color="#ff4d4f" />
                  <br />
                  Không tìm thấy sản phẩm nào!
                </p>
              </div>
            ) : (
              dataListSP.map((item, index) => (
                <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-12" key={index}>
                  <div className="product-card shadow-sm rounded">
                    <div className="product-image-wrapper">
                      <img
                        src={item.Image}
                        alt={item.TenSP}
                        className="product-image"
                      />
                      {item.GiamGiaSP !== 0 && (
                        <span className="discount-badge">-{item.GiamGiaSP}%</span>
                      )}
                    </div>
                    <div className="product-content p-3">
                      <span className="brand text-muted">{item.IdHangSX?.TenHangSX}</span>
                      <h5 className="product-name">{item.TenSP}</h5>
                      <div className="price-section">
                        <span className="current-price">
                          {Math.ceil(
                            item.sizes[0].price - item.sizes[0].price * (item.GiamGiaSP / 100)
                          ).toLocaleString()}
                          đ
                        </span>
                        {item.GiamGiaSP !== 0 && (
                          <span className="old-price">
                            {item.sizes[0].price.toLocaleString()}đ
                          </span>
                        )}
                      </div>
                      <Button
                        type="primary"
                        style={{ width: "100%", marginTop: "10px", borderRadius: "6px" }}
                        onClick={() => console.log("Xem chi tiết", item._id)} // Thay bằng logic thực tế
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Phân trang */}
          {dataListSP?.length > 0 && (
            <div className="pagination-area mt-5 text-center">
              <Pagination
                current={current}
                pageSize={pageSize}
                total={total}
                onChange={(page, size) => {
                  setCurrent(page);
                  setPageSize(size);
                }}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `Tổng ${total} sản phẩm`}
                responsive
              />
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
            {/* shop[ grid sidebar wrapper end */}
        </>
    )
}
export default AllProduct