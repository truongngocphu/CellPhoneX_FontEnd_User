import { Button, Carousel, Col, InputNumber, message, Pagination, Row, Tabs } from "antd"
import { IoWarningOutline } from "react-icons/io5"
import ModalViewDetail from "../Modal/ModalViewDetail"
import { useEffect, useState } from "react"
import { fetchAllProduct, fetchSPDetail } from "../../services/productAPI"
import { useNavigate } from "react-router-dom"
import imgBannerpng2 from '../../assets/images/banner/imgBannerpng2.png'
import bannert2 from '../../assets/images/banner/bannert2.jpg'
import bannert3 from '../../assets/images/banner/banner-apple-didongviet.jpg'
import './css.scss'
import { checkProductAvailability, doAddAction } from "../../redux/order/orderSlice"
import { useDispatch, useSelector } from "react-redux"
import { doAddActionWishlist } from "../../redux/wishlist/wishlistSlice"
const BodyProduct = (props) => {

    const {
        dataListSP, setDataListSP, current, setCurrent, setPageSize, pageSize, total, setTotal
    } = props

    const navigate = useNavigate()
    const [activeKey, setActiveKey] = useState('tatca'); // Không chọn tab mặc định
    const [openDetail, setOpenDetail] = useState(false)
    const [dataDetailSP, setDataDetailSP] = useState(null)
    const [idDetail, setIdDetail] = useState('')

    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [discountCode, setDiscountCode] = useState("MAVOUCHER");  // Mã giảm giá
    const customerId = useSelector(state => state.accountKH.user._id)
    const dispatch = useDispatch()

    const fetchProductDetail = async () => {

        console.log("Fetching product with idDetail: ", idDetail);  // Kiểm tra giá trị idDetail
        if (idDetail && idDetail !== '') { // Kiểm tra idDetail hợp lệ
            const res = await fetchSPDetail(idDetail);
            console.log("res TL: ", res);
            if (res && res.data) {
                setDataDetailSP(res.data);
            }
        } else {
            message.error("idDetail is not valid");
        }
    }

    useEffect(() => {
        if (idDetail) {
            console.log("Updated idDetail: ", idDetail);
            fetchProductDetail();  // Gọi lại API khi idDetail thay đổi
        }
    }, [idDetail]);


    const handleOnchangePage = (pagination) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }

        // Cuộn về đầu trang
        window.scrollTo({ top: 600, behavior: 'smooth' });
    }

    const handleRedirectLayIdDeXemDetail = (item) => {
        console.log("id: ", item);
        if (item) {
            console.log("set tiep id");
            setIdDetail(item);  // Cập nhật idDetail
            setOpenDetail(true);
        }
    }

    const handleRedirectLayIdDeXemDetailPageUrl = (item) => {
        console.log("id: ", item);
        // Lấy các _id từ mảng idLoaiSP và chuyển thành chuỗi
        const idLoaiSPString = item.IdLoaiSP.map(loai => loai._id).join(',');
        // navigate(`/detail-product?id=${item._id}&idLoaiSP=${idLoaiSPString}`)
        window.location.href = (`/detail-product?id=${item._id}&idLoaiSP=${idLoaiSPString}`)
    }

    const onChangeQuantity = (value) => {
        console.log('changed', value);
        setCurrentQuantity(value);
    };

    const handleAddToCart = (product, giaChon, sizeChon) => {  // Thêm async ở đây để có thể sử dụng await bên trong
        console.log("product, giaChon, sizeChon, currentQuantity:", product, giaChon, sizeChon, currentQuantity);

        // Hàm kiểm tra số lượng sản phẩm, trả về một Promise
        const handleAddToCartt = () => {
            // Truyền thông tin sản phẩm vào checkProductAvailability
            return dispatch(checkProductAvailability({ dataDetailSP: product, selectedSize: sizeChon, currentQuantity }))
                .then(availability => {
                    console.log("availability: ", availability);

                    // Kiểm tra nếu không có đủ số lượng sản phẩm
                    if (!availability.payload) {
                        console.log("Sản phẩm không đủ số lượng");
                        return false;  // Nếu không đủ số lượng, trả về false
                    }

                    console.log("Số lượng đủ, tiếp tục thêm vào giỏ hàng");
                    return true;  // Nếu đủ số lượng, trả về true
                })
                .catch(error => {
                    console.error("Error checking availability:", error);
                    return false;  // Nếu có lỗi xảy ra, trả về false
                });
        };

        // Sử dụng .then() để xử lý kết quả từ handleAddToCartt
        handleAddToCartt()
            .then(isAvailable => {
                if (!isAvailable) {
                    console.log("Không thể thêm sản phẩm vào giỏ hàng do số lượng không đủ");
                    return;
                }

                // Nếu số lượng đủ, tiếp tục dispatch hành động thêm vào giỏ hàng
                dispatch(doAddAction({ dataDetailSP: product, currentQuantity, discountCode, customerId, selectedItemss: giaChon, selectedSize: sizeChon }));
            })
            .catch(error => {
                console.error("Có lỗi khi thêm sản phẩm vào giỏ hàng:", error);
            });

        // dispatch(doAddAction({ dataDetailSP: product, currentQuantity, discountCode, customerId, selectedItemss: giaChon, selectedSize: sizeChon }));
    };

    const handleAddToCart1 = (product, giaChon, sizeChon) => {
        console.log("product, giaChon, sizeChon, currentQuantity:", product, giaChon, sizeChon, currentQuantity);

        dispatch(doAddAction({ dataDetailSP: product, currentQuantity, discountCode, customerId, selectedItemss: giaChon, selectedSize: sizeChon }));
    };
    const handleAddWishList = (product, giaChon, sizeChon) => {
        console.log("product, giaChon, sizeChon, currentQuantity:", product, giaChon, sizeChon, currentQuantity);

        dispatch(doAddActionWishlist({ dataDetailSP: product, customerId, selectedItemss: giaChon, selectedSize: sizeChon }));
    };


    return (
        <div className="col-xl-9 col-lg-12">
            <div className="filter-select-area">
                <Carousel autoplay speed={500} autoplaySpeed={2500}>
                    <img className="img-sliderr" style={{ borderRadius: "15px" }} src={imgBannerpng2} alt="" />
                    <img className="img-sliderr" style={{ borderRadius: "15px" }} src={bannert2} alt="" />
                    <img className="img-sliderr" style={{ borderRadius: "15px" }} src={bannert3} alt="" />
                </Carousel>
                {/* <div className="nice-select-area-wrapper-and-button">
                    <div className="nice-select-wrapper-1">                        
                        <div className="single-select">
                            <select>
                            <option data-display="All Categories">All Categories</option>
                            <option value={1}>Some option</option>
                            <option value={2}>Another option</option>
                            <option value={3} disabled>A disabled option</option>
                            <option value={4}>Potato</option>
                            </select>

                        </div>
                        <div className="single-select">
                            <select>
                            <option data-display="All Brands">All Brands</option>
                            <option value={1}>Some option</option>
                            <option value={2}>Another option</option>
                            <option value={3} disabled>A disabled option</option>
                            <option value={4}>Potato</option>
                            </select>
                        </div>
                        <div className="single-select">
                            <select>
                            <option data-display="All Size">All Size </option>
                            <option value={1}>Some option</option>
                            <option value={2}>Another option</option>
                            <option value={3} disabled>A disabled option</option>
                            <option value={4}>Potato</option>
                            </select>
                        </div>
                        <div className="single-select">
                            <select>
                            <option data-display="All Weight">All Weight</option>
                            <option value={1}>Some option</option>
                            <option value={2}>Another option</option>
                            <option value={3} disabled>A disabled option</option>
                            <option value={4}>Potato</option>
                            </select>
                        </div>
                    </div>
                    <div className="button-area">
                        <button className="rts-btn">Reset Filter</button>
                    </div>
                </div> */}
            </div>
            <div className="tab-content" id="myTabContent">
                <div
                    className="product-area-wrapper-shopgrid-list tab-pane fade show active"
                    id="home-tab-pane"
                    role="tabpanel"
                    aria-labelledby="home-tab"
                    tabIndex={0}
                >
                    <div className="row g-4">
                        {dataListSP.length !== 0 ? (
                            dataListSP?.map((item, index) => (
                                <div className="col-lg-3 col-md-4 col-sm-6 col-12" key={index}>
                                    <div className="product-card cellphone-style">
                                        {/* Hình ảnh và hành động */}
                                        <div className="product-image-wrapper">
                                            <a
                                                onClick={() => handleRedirectLayIdDeXemDetailPageUrl(item)}
                                                className="thumbnail"
                                            >
                                                <img
                                                    src={item.Image}
                                                    alt={item.TenSP}
                                                    className="product-image"
                                                />
                                                {item.GiamGiaSP !== 0 && (
                                                    <span className="discount-badge">-{item.GiamGiaSP}%</span>
                                                )}
                                            </a>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleAddWishList(item, item.sizes[0].price, item.sizes[0].size)}
                                                    title="Thêm vào danh sách yêu thích"
                                                >
                                                    <i className="fa-light fa-heart" />
                                                </button>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => {
                                                        handleRedirectLayIdDeXemDetail(item._id);
                                                        setOpenDetail(true);
                                                    }}
                                                    title="Xem chi tiết"
                                                >
                                                    <i className="fa-regular fa-eye" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Nội dung sản phẩm */}
                                        <div className="product-content">
                                            <span className="brand text-muted">{item.IdHangSX?.TenHangSX}</span>
                                            <a
                                                onClick={() => handleRedirectLayIdDeXemDetailPageUrl(item)}
                                                className="product-name"
                                            >
                                                {item.TenSP}
                                            </a>
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
                                            <button
                                                className="add-to-cart-btn"
                                                onClick={() => handleAddToCart(item, item.sizes[0].price, item.sizes[0].size)}
                                            >
                                                <i className="fa-regular fa-cart-shopping me-2" />
                                                Thêm vào giỏ hàng
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5">
                                <IoWarningOutline size={80} color="#ff4d4f" />
                                <p style={{ color: "#ff4d4f", fontSize: "1.5rem", marginTop: "10px" }}>
                                    Chưa có sản phẩm nào!
                                </p>
                            </div>
                        )}

                        {/* Phân trang và Modal */}
                        {dataListSP.length !== 0 && (
                            <Row className="justify-content-center mt-5">
                                <Pagination
                                    responsive
                                    current={current}
                                    pageSize={pageSize}
                                    total={total}
                                    onChange={(p, s) => handleOnchangePage({ current: p, pageSize: s })}
                                    showSizeChanger={true}
                                    showQuickJumper={true}
                                    showTotal={(total, range) => (
                                        <div>
                                            {range[0]}-{range[1]} trên {total} sản phẩm
                                        </div>
                                    )}
                                    locale={{
                                        items_per_page: "sản phẩm / trang",
                                        jump_to: "Đến trang",
                                        jump_to_confirm: "Xác nhận",
                                        page: "",
                                    }}
                                />

                                <ModalViewDetail
                                    openDetail={openDetail}
                                    setOpenDetail={setOpenDetail}
                                    setDataDetailSP={setDataDetailSP}
                                    setIdDetail={setIdDetail}
                                    dataDetailSP={dataDetailSP}
                                />
                            </Row>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
export default BodyProduct