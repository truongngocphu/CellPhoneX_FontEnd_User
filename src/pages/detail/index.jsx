import './css.scss'
import svg01 from '/src/assets/images/shop/01.svg'
import svg02 from '/src/assets/images/shop/02.svg'
import svg03 from '/src/assets/images/shop/03.svg'
import png03 from '/src/assets/images/shop/03.png'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { fetchAllProductToCategoryLienQuan, fetchSPDetail } from '../../services/productAPI'
import { Avatar, Button, Col, Divider, Form, Input, InputNumber, message, Modal, notification, Pagination, Rate, Row, Select, Skeleton, Spin, Tooltip } from 'antd'
import ImageGallery from "react-image-gallery";
import { useDispatch, useSelector } from 'react-redux'
import { IoWarningOutline } from 'react-icons/io5'
import ModalViewDetail from '../../components/Modal/ModalViewDetail'
import { checkProductAvailability, doAddAction } from '../../redux/order/orderSlice'
import { doAddActionWishlist } from '../../redux/wishlist/wishlistSlice'
import { LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { createComment, deleteComment, fetchAllComment } from '../../services/commentAPI'
import { RiDeleteBin6Line } from 'react-icons/ri'
import LuckyWheel from './LuckyWheel'
import { CSSTransition } from 'react-transition-group'

const DetailProduct = () => {
    const refGallery = useRef(null);
    const navigate = useNavigate()
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const [idDetail, setIdDetail] = useState(null)
    const [dataDetailSP, setDataDetailSP] = useState(null)
    const [dataDetailSPModal, setDataDetailSPModal] = useState(null)
    const [selectedItemss, setSelectedItemss] = useState('');
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [dataProductToCategory, setDataProductToCategory] = useState([])
    const [openDetail, setOpenDetail] = useState(false)
    const isAuthenticated = useSelector((state) => state.accountKH.isAuthenticated);

    const customerId = useSelector(state => state.accountKH.user._id)
    const [discountCode, setDiscountCode] = useState("MAVOUCHER");  // Mã giảm giá
    const [selectedSize, setSelectedSize] = useState('');  // Kích thước đã chọn

    const [current, setCurrent] = useState(1)
    const [pageSize, setPageSize] = useState(12)
    const [total, setTotal] = useState(0)

    const [currentCmt, setCurrentCmt] = useState(1)
    const [pageSizeCmt, setPageSizeCmt] = useState(5)
    const [totalCmt, setTotalCmt] = useState(0)

    const [formComment] = Form.useForm()
    const [dataComment, setDataComment] = useState([])
    const [starCount, setStarCount] = useState([]);
    console.log("datacomment: ", dataComment);
    console.log("starCount: ", starCount);

    const [loading, setLoading] = useState(true);
    const [showProductImage, setShowProductImage] = useState(false); // Hiển thị sản phẩm khi thêm vào giỏ
    const cartRef = useRef(null); // Tham chiếu đến giỏ hàng

    const tooltips = ['Chưa hài lòng', 'Không tốt', 'Bình thường', 'Tốt', 'Rất tốt'];

    useEffect(() => {
        if (dataDetailSP) {
            setLoading(false);
        }
    }, [dataDetailSP]);


    const handleComment = async (values) => {
        console.log('Giá trị đánh giá sao: ', values.rating); // Lấy giá trị rating khi submit
        console.log('Giá trị bình luận: ', values.note); // Lấy giá trị bình luận
        console.log('data comment: ', values.note, values.rating, customerId, dataDetailSP?._id); // Lấy giá trị bình luận

        const res = await createComment(values.note, values.rating, customerId, dataDetailSP?._id)
        if (res && res.data) {
            message.success(res.message);
            // setDataComment(res.data)
            // Thêm bình luận mới vào danh sách bình luận hiện tại
            const newComment = {
                title: values.note,
                soSaoDanhGia: values.rating,
                idKH: customerId,
                idSP: dataDetailSP?._id,
                createdAt: new Date(), // Có thể bạn sẽ cần xử lý lại ngày tháng tùy theo yêu cầu
            };

            setDataComment((prevData) => [newComment, ...prevData]); // Thêm bình luận mới vào đầu danh sách bình luận
            formComment.resetFields()
            await handleFindComments()
        } else {
            notification.error({
                message: 'comment không thành công!',
                description: res.message
            })
        }
    }

    const handleFindComments = async () => {
        let query = `page=${currentCmt}&limit=${pageSizeCmt}&idSP=${dataDetailSP?._id}`
        const res = await fetchAllComment(query)
        console.log("res datacomment: ", res);
        if (res && res.data) {
            // message.success(res.message)
            setDataComment(res.data.comments)
            setStarCount(res.data.starCount);
            setTotalCmt(res.data.totalComments)
        }
    }

    const handleDeleteComment = async (id) => {

        let xoaComment = await deleteComment(id)
        if (xoaComment && xoaComment.data) {
            message.success(xoaComment.message)
            await handleFindComments()
        } else {
            notification.error({
                message: 'delete comment không thành công!',
                description: xoaComment.message
            })
        }
    }


    useEffect(() => {
        handleFindComments()
    }, [dataDetailSP?._id, customerId, currentCmt, pageSizeCmt])

    let tenSearch = queryParams.get('TenSP')
    console.log("tensp lien quan: ", tenSearch);


    console.log("currentQuantity them gio hang: ", currentQuantity);
    console.log("selectedSize da chon: ", selectedSize);

    const dispatch = useDispatch();
    // Lấy giá trị của tham số 'id'
    const id = queryParams.get('id');
    const idLoaiSP = queryParams.get('idLoaiSP');
    console.log("id: ", id);
    console.log("idLoaiSP: ", idLoaiSP);

    const fetchProductDetail = async () => {
        if (!dataDetailSP) { // Chỉ fetch khi dataDetailSP chưa có dữ liệu
            const res = await fetchSPDetail(id);
            console.log("res TL: ", res);
            if (res && res.data) {
                setDataDetailSP(res.data);
            }
        }
    }

    const handleFindProductToCategory = async () => {
        let query = `page=${current}&limit=${pageSize}`
        // Kiểm tra nếu idLoaiSP là mảng hoặc một giá trị đơn
        const idLoaiSPArray = Array.isArray(idLoaiSP) ? idLoaiSP : [idLoaiSP];  // Nếu không phải mảng, chuyển thành mảng

        if (idLoaiSPArray.length > 0) {
            query += `&IdLoaiSP=${idLoaiSPArray.join(',')}`;  // Chuyển mảng thành chuỗi cách nhau bằng dấu phẩy
        }

        if (tenSearch) {
            query += `&TenSP=${encodeURIComponent(tenSearch)}`;
        }

        const res = await fetchAllProductToCategoryLienQuan(query)
        console.log("res sp: ", res);
        if (res && res.data && res.data.length > 0) {
            // Nếu có sản phẩm thì cập nhật lại state
            setDataProductToCategory(res.data);
            setTotal(res.totalSanPham)
        } else {
            // Nếu không có sản phẩm, sẽ không cần làm gì nữa
            setDataProductToCategory([]);
        }
    }
    const handleOnchangePage = (pagination) => {
        if (pagination && pagination.current !== current) {
            setCurrent(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSize) {
            setPageSize(pagination.pageSize)
            setCurrent(1);
        }

        // Cuộn về đầu trang
        window.scrollTo({ top: 1999, behavior: 'smooth' });
    }
    const handleOnchangePageCMT = (pagination) => {
        if (pagination && pagination.current !== currentCmt) {
            setCurrentCmt(pagination.current)
        }
        if (pagination && pagination.pageSize !== pageSizeCmt) {
            setPageSizeCmt(pagination.pageSize)
            setCurrentCmt(1);
        }

        // Cuộn về đầu trang
        window.scrollTo({ top: 1000, behavior: 'smooth' });
    }

    const fetchProductDetailViewModal = async () => {
        if (!dataDetailSPModal) { // Chỉ fetch khi dataDetailSP chưa có dữ liệu
            const res = await fetchSPDetail(idDetail);
            console.log("res TL: ", res);
            if (res && res.data) {
                setDataDetailSPModal(res.data);
            }
        }
    }

    useEffect(() => {
        fetchProductDetailViewModal()
    }, [idDetail])

    useEffect(() => {
        fetchProductDetail()
    }, [id])

    useEffect(() => {
        handleFindProductToCategory()
    }, [idLoaiSP, current, pageSize, tenSearch])

    useEffect(() => {
        if (dataDetailSP?.sizes.length > 0) {
            // Gán giá trị của size đầu tiên vào selectedItems khi component được mount
            setSelectedItemss(dataDetailSP.sizes[0].price);
        }

        if (dataDetailSP?.sizes.length > 0) {
            // Gán giá trị của size đầu tiên vào selectedItems khi component được mount
            setSelectedSize(dataDetailSP.sizes[0].size);
        }
    }, [dataDetailSP]);


    const handleRedirectLayIdDeXemDetail = (item) => {
        console.log("id: ", item);
        setIdDetail(item)
    }

    const onChangeSizes = (e) => {
        console.log("value: ", e);
        // setSelectedItemss(e)

        const selectedSizeObj = dataDetailSP.sizes.find(item => item._id === e);  // Tìm đối tượng kích thước dựa trên giá
        if (selectedSizeObj) {
            setSelectedItemss(selectedSizeObj.price)
            setSelectedSize(selectedSizeObj.size); // Lưu kích thước (ví dụ: '128gb' hoặc '256gb')
        }
    }
    const onChangeQuantity = (value) => {
        console.log('changed soluong', value);
        setCurrentQuantity(value)
    };


    // Biến đổi mảng tên file thành các URL ảnh
    const images = dataDetailSP?.ImageSlider?.map(imageName => ({
        original: imageName,
        thumbnail: imageName,
         // Nếu bạn có ảnh thumbnail riêng, thay đổi cho phù hợp
    })) ?? [];


    const handleOnClickImage = () => {
        refGallery?.current?.fullScreen()
    }

    const handleRedirectLayIdDeXemDetailPageUrl = (item) => {
        console.log("id: ", item);
        // Lấy các _id từ mảng idLoaiSP và chuyển thành chuỗi
        const idLoaiSPString = item.IdLoaiSP.map(loai => loai._id).join(',');
        // navigate(`/detail-product?id=${item._id}&idLoaiSP=${idLoaiSPString}`)
        window.location.href = `/detail-product?id=${item._id}&idLoaiSP=${idLoaiSPString}`;
    }

    const handleAddToCart = async () => {

        // Truyền thông tin sản phẩm vào checkProductAvailability
        const availability = await dispatch(
            checkProductAvailability({ dataDetailSP, selectedSize, currentQuantity })
        );
        console.log("availability: ", availability);

        if (!availability.payload) {
            // Nếu không đủ số lượng, hiển thị thông báo lỗi                        
            setShowProductImage(false)
            return;
        }

        console.log("Số lượng đủ, tiếp tục thêm vào giỏ hàng");

        // Thực hiện thêm sản phẩm vào giỏ hàng
        try {
            await dispatch(doAddAction({ dataDetailSP, currentQuantity, discountCode, customerId, selectedItemss, selectedSize }));

            setShowProductImage(true);

            setTimeout(() => {
                setShowProductImage(false); // Ẩn hình ảnh sản phẩm bay sau khi hiệu ứng hoàn tất
            }, 1000); // Đợi 1s để hoàn tất hiệu ứng

        } catch (error) {
            // Nếu có lỗi khi thêm vào giỏ hàng, hiển thị thông báo lỗi
            notification.error({
                message: 'Có lỗi xảy ra',
                description: 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.',
                placement: 'topRight',
            });
        }
    };

    const handleAddToCart2 = async () => {
        // Truyền thông tin sản phẩm vào checkProductAvailability
        const availability = await dispatch(
            checkProductAvailability({ dataDetailSP, selectedSize, currentQuantity })
        );
        console.log("availability: ", availability);

        if (!availability.payload) {
            // Nếu không đủ số lượng, hiển thị thông báo lỗi            
            return;
        }

        console.log("Số lượng đủ, tiếp tục thêm vào giỏ hàng");

        dispatch(doAddAction({ dataDetailSP, currentQuantity, discountCode, customerId, selectedItemss, selectedSize }));
    };

    const handleAddToCart1 = () => {
        dispatch(doAddAction({ dataDetailSP, currentQuantity, discountCode, customerId, selectedItemss, selectedSize }));
    };

    const handleAddWishList = () => {

        dispatch(doAddActionWishlist({ dataDetailSP, customerId, selectedItemss, selectedSize }));
    };

    const handleLoginNotification = () => {
        notification.error({
            message: "Không thể viết đánh giá khi chưa đăng nhập!",
            description: (
                <div>
                    Vui lòng tạo tài khoản để có thể đánh giá sản phẩm này!  &nbsp;&nbsp;&nbsp;
                    <a
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                            navigate('/login-web')
                        }}
                        style={{
                            // marginTop: '10px',
                            // padding: '5px 10px',
                            // color: '#fff',
                            // backgroundColor: '#1890ff',
                            // border: 'none',
                            // borderRadius: '4px',
                            // cursor: 'pointer',
                            color: "blue"
                        }}
                    >
                        Ấn vào đây để đăng nhập
                    </a>
                </div>
            ),
        });
    };

    const [spinResult, setSpinResult] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const segments = ["Prize 1", "Prize 2", "Prize 3", "Prize 4", "Try Again"];
    const segmentColors = ["#FF5733", "#33FF57", "#3357FF", "#FF33FF", "#FFD700"];
    const onFinished = (winner) => {
        setSpinResult(winner);
        setModalVisible(true);
    };

    const soLuongTonKho = dataDetailSP?.sizes.reduce((total, size) => total + size.quantity, 0)

    return (
        <>
            <div className="rts-navigation-area-breadcrumb bg_light-1">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="navigator-breadcrumb-wrapper">
                                <a href='#' onClick={() => navigate('/')}>Home</a>
                                <i className="fa-regular fa-chevron-right" />
                                <a className="#">Chi tiết sản phẩm</a>
                                <i className="fa-regular fa-chevron-right" />
                                <a className="current">{dataDetailSP?.TenSP}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section-seperator bg_light-1">
                <div className="container">
                    <hr className="section-seperator" />
                </div>
            </div>

            <div className="rts-shop-details-area rts-section-gap bg-light">
                <div className="container">
                    <div className="shop-details-wrapper modern-style">
                        <div className="row g-5">
                            {/* Phần chính: Hình ảnh và thông tin sản phẩm */}
                            <div className="col-xl-8 col-lg-8 col-md-12">
                                <div className="product-details-container">
                                    <div className="rts-product-details-section">
                                        <h1 className="product-title text-center mb-4">{dataDetailSP?.TenSP}</h1>
                                        <div className="divider-shadow mb-4"></div>

                                        <div className="product-details-content">
                                            <Row gutter={[30, 20]}>
                                                {/* Hình ảnh sản phẩm */}
                                                {loading ? (
                                                    <Col span={10}>
                                                        <Skeleton.Image active className="w-100" />
                                                    </Col>
                                                ) : (
                                                    <Col span={10}>
                                                        <div className="image-gallery-container">
                                                            <ImageGallery
                                                                ref={refGallery}
                                                                items={images}
                                                                showPlayButton={false}
                                                                showFullscreenButton={false}
                                                                renderLeftNav={() => <></>}
                                                                renderRightNav={() => <></>}
                                                                slideOnThumbnailOver={true}
                                                                onClick={handleOnClickImage}
                                                                className="product-image-gallery"
                                                                showThumbnails={true} // Đảm bảo thumbnails được hiển thị
                                                                thumbnailPosition="bottom" // Vị trí mặc định là dưới, sẽ điều chỉnh bằng CSS
                                                            />
                                                        </div>
                                                    </Col>
                                                )}
                                                {/* Thông tin chi tiết sản phẩm */}
                                                {loading ? (
                                                    <Col span={14}>
                                                        <Skeleton paragraph={{ rows: 5 }} active />
                                                    </Col>
                                                ) : (
                                                    <Col span={14}>
                                                        <div className="product-info">
                                                            {/* Tình trạng và đánh giá */}
                                                            <div className="product-status d-flex align-items-center mb-3">
                                                                <span
                                                                    className={`stock-status ${dataDetailSP?.sizes.reduce((total, size) => total + size.quantity, 0) === 0
                                                                        ? "out-of-stock"
                                                                        : "in-stock"
                                                                        }`}
                                                                >
                                                                    {dataDetailSP?.sizes.reduce((total, size) => total + size.quantity, 0) === 0
                                                                        ? "Hết hàng"
                                                                        : "Còn hàng"}
                                                                </span>
                                                                <div className="rating-stars ms-3">
                                                                    {[...Array(5)].map((_, index) => (
                                                                        <i key={index} className="fas fa-star text-warning" />
                                                                    ))}
                                                                    <span className="ms-2">({totalCmt} Đánh giá)</span>
                                                                </div>
                                                            </div>

                                                            {/* Giá sản phẩm */}
                                                            <div className="product-price mb-4">
                                                                {dataDetailSP?.GiamGiaSP !== 0 ? (
                                                                    <>
                                                                        <span className="discounted-price text-primary fw-bold fs-2">
                                                                            {Math.ceil(
                                                                                selectedItemss - selectedItemss * (dataDetailSP?.GiamGiaSP / 100)
                                                                            ).toLocaleString()}
                                                                            đ
                                                                        </span>
                                                                        <span className="old-price text-muted text-decoration-line-through ms-2">
                                                                            {selectedItemss.toLocaleString()}đ
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="price text-primary fw-bold fs-2">
                                                                        {selectedItemss.toLocaleString()}đ
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Mô tả ngắn */}
                                                            <p
                                                                className="description text-muted mb-4"
                                                                dangerouslySetInnerHTML={{ __html: dataDetailSP?.MoTa }}
                                                            />

                                                            {/* Tùy chọn size và số lượng */}
                                                            <div className="product-options mb-4">
                                                                <Row gutter={[15, 15]}>
                                                                    <Col md={16} xs={24}>
                                                                        <div className="option-group">
                                                                            <label className="fw-bold mb-2">Size</label>
                                                                            <Select
                                                                                disabled={soLuongTonKho === 0}
                                                                                placeholder="Chọn size"
                                                                                value={selectedSize}
                                                                                onChange={onChangeSizes}
                                                                                className="w-100 modern-select"
                                                                                options={dataDetailSP?.sizes.map((item) => ({
                                                                                    value: item._id,
                                                                                    label: item.size,
                                                                                }))}
                                                                            />
                                                                        </div>
                                                                    </Col>
                                                                    <Col md={8} xs={24}>
                                                                        <div className="option-group">
                                                                            <label className="fw-bold mb-2">Số lượng</label>
                                                                            <InputNumber
                                                                                size="large"
                                                                                disabled={soLuongTonKho === 0}
                                                                                min={1}
                                                                                max={1000}
                                                                                value={currentQuantity}
                                                                                defaultValue={1}
                                                                                onChange={onChangeQuantity}
                                                                                className="w-100 modern-input-number" style={{ padding: "5px" }}
                                                                            />
                                                                        </div>
                                                                    </Col>
                                                                </Row>
                                                            </div>

                                                            {/* Nút thêm vào giỏ hàng */}
                                                            <div className="product-actions mb-4">
                                                                <CSSTransition
                                                                    in={showProductImage}
                                                                    timeout={1000}
                                                                    classNames="fly-to-cart"
                                                                    unmountOnExit
                                                                    onExited={() => setShowProductImage(false)}
                                                                >
                                                                    <img
                                                                        className="fly-product-image"
                                                                        src={dataDetailSP?.Image}
                                                                        alt={dataDetailSP?.TenSP}
                                                                    />
                                                                </CSSTransition>
                                                                <button
                                                                    onClick={soLuongTonKho === 0 ? undefined : handleAddToCart}
                                                                    className={`btn btn-primary w-100 py-3 fw-bold ${soLuongTonKho === 0 ? "disabled" : ""
                                                                        }`}
                                                                    disabled={soLuongTonKho === 0}
                                                                >
                                                                    <i className="fa-regular fa-cart-shopping me-2" />
                                                                    {soLuongTonKho === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                                                                </button>
                                                            </div>

                                                            {/* Thông tin bổ sung */}
                                                            <div className="product-meta text-muted">
                                                                <p>Thương hiệu: <strong>{dataDetailSP?.IdHangSX.TenHangSX}</strong></p>
                                                                <p>
                                                                    Loại sản phẩm:{" "}
                                                                    {dataDetailSP?.IdLoaiSP?.map((item, index) => (
                                                                        <span key={index}>
                                                                            {item.TenLoaiSP}
                                                                            {index < dataDetailSP.IdLoaiSP.length - 1 ? ", " : ""}
                                                                        </span>
                                                                    ))}
                                                                </p>
                                                                <p>Giảm giá: <strong>{dataDetailSP?.GiamGiaSP}%</strong></p>
                                                                <p>Số lượng đã bán: <strong>{dataDetailSP?.SoLuongBan}</strong></p>
                                                            </div>

                                                            {/* Chia sẻ */}
                                                            <div className="share-options d-flex gap-3 mt-4">
                                                                <button className="btn btn-outline-secondary" onClick={handleAddWishList}>
                                                                    <i className="fa-regular fa-heart me-2" /> Yêu thích
                                                                </button>
                                                                <button className="btn btn-outline-secondary">
                                                                    <i className="fa-solid fa-share me-2" /> Chia sẻ
                                                                </button>
                                                                <button className="btn btn-outline-secondary">
                                                                    <i className="fa-light fa-code-compare me-2" /> So sánh
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>
                                    </div>

                                    {/* Tab chi tiết */}
                                    <div className="product-tabs mt-5">
                                        <ul className="nav nav-tabs modern-tabs" id="myTab" role="tablist">
                                            <li className="nav-item">
                                                <button
                                                    className="nav-link active"
                                                    id="home-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#home-tab-pane"
                                                    type="button"
                                                    role="tab"
                                                >
                                                    Chi tiết sản phẩm
                                                </button>
                                            </li>
                                            <li className="nav-item">
                                                <button
                                                    className="nav-link"
                                                    id="profile-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#profile-tab-pane"
                                                    type="button"
                                                    role="tab"
                                                >
                                                    Thông tin bổ sung
                                                </button>
                                            </li>
                                            <li className="nav-item">
                                                <button
                                                    className="nav-link"
                                                    id="review-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#review-tab-pane"
                                                    type="button"
                                                    role="tab"
                                                >
                                                    Đánh giá ({totalCmt})
                                                </button>
                                            </li>
                                        </ul>
                                        <div className="tab-content mt-4" id="myTabContent">
                                            <div className="tab-pane fade show active" id="home-tab-pane" role="tabpanel">
                                                <div
                                                    className="tab-content-inner"
                                                    dangerouslySetInnerHTML={{ __html: dataDetailSP?.MoTaChiTiet }}
                                                    style={{ fontSize: "16px" }}
                                                />
                                            </div>
                                            <div className="tab-pane fade" id="profile-tab-pane" role="tabpanel" style={{ fontSize: "14px" }}>
                                                <div className="tab-content-inner">
                                                    <table className="table table-bordered">
                                                        <thead>
                                                            <tr>
                                                                <th>Thông số chi tiết</th>
                                                                <th>Giá tương ứng</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {dataDetailSP?.sizes?.map((item) => (
                                                                <tr key={item._id}>
                                                                    <td>{item.size}</td>
                                                                    <td>{item.price.toLocaleString()}đ</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                    <p className="mt-3">
                                                        <strong>Trả hàng/Hủy hàng:</strong> Không áp dụng đổi hàng đã giao. Nếu có vấn đề về chất lượng hoặc số lượng, khách hàng có thể trả hàng khi có mặt người giao hàng.
                                                    </p>
                                                    <p>
                                                        <strong>Lưu ý:</strong> Thời gian giao hàng có thể thay đổi tùy theo tình trạng kho.
                                                    </p>
                                                    <div
                                                        className="youtube-video mt-3"
                                                        dangerouslySetInnerHTML={{ __html: dataDetailSP?.urlYoutube }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="tab-pane fade" id="review-tab-pane" role="tabpanel">
                                                <div className="tab-content-inner">
                                                    {/* Đánh giá sẽ được giữ nguyên logic của bạn */}
                                                    {/* Chỉ tinh chỉnh giao diện nếu cần */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="col-xl-4 col-lg-4 col-md-12 rts-sticky-column">
                                <div className="sidebar-sticky">
                                    <div className="offers-section mb-4 p-4 bg-white shadow-sm rounded">
                                        <h6 className="fw-bold mb-3">Ưu đãi có sẵn</h6>
                                        <div className="offer-item d-flex mb-3">
                                            <img src={svg01} alt="icon" className="me-3" width="40" />
                                            <p className="mb-0">Giảm 5% cho đơn hàng đầu tiên qua UPI Ekomart.</p>
                                        </div>
                                        <div className="offer-item d-flex mb-3">
                                            <img src={svg02} alt="icon" className="me-3" width="40" />
                                            <p className="mb-0">Giảm 500K cho đơn từ 9M khi trả góp bằng thẻ Citi.</p>
                                        </div>
                                        <div className="offer-item d-flex">
                                            <img src={svg03} alt="icon" className="me-3" width="40" />
                                            <p className="mb-0">Miễn phí vận chuyển cho đơn trên 1.000.000đ.</p>
                                        </div>
                                    </div>
                                    <div className="payment-section p-4 bg-white shadow-sm rounded">
                                        <h6 className="fw-bold mb-3">Thanh toán an toàn</h6>
                                        <img src={png03} alt="payment-methods" className="w-100" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* rts grocery feature area start */}
            <div className="related-products-area rts-section-gapBottom">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title text-center mb-4">
                                <h2 className="title" style={{ color: "#003087", fontWeight: 700 }}>
                                    Sản phẩm liên quan
                                </h2>
                                <div className="title-divider mx-auto"></div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        {dataProductToCategory?.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <IoWarningOutline size={80} color="#ff4d4f" />
                                <p style={{ color: "#ff4d4f", fontSize: "1.5rem", marginTop: "10px" }}>
                                    Chưa có sản phẩm nào!
                                </p>
                            </div>
                        ) : (
                            dataProductToCategory.map((item, index) => (
                                <div className="col-xl-3 col-lg-3 col-md-4 col-sm-6 col-12" key={index} >
                                    <div className="product-card cellphone-style">
                                        {/* Hình ảnh và badge */}
                                        <div className="product-image-wrapper">
                                            <a style={{ fontSize: "14px" }}
                                                onClick={() => handleRedirectLayIdDeXemDetailPageUrl(item)}
                                                className="thumbnail"
                                            >
                                                <img
                                                    src={item.Image}
                                                    alt={item.TenSP}
                                                    className="product-image"
                                                />
                                                {item.GiamGiaSP !== 0 && (
                                                    <div className="discount-badge" style={{ fontSize: "14px" }}>
                                                        <span>-{item.GiamGiaSP}%</span>
                                                    </div>
                                                )}
                                            </a>
                                            <div className="action-buttons">
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleAddWishList()}
                                                    title="Yêu thích"
                                                >
                                                    <i className="fa-light fa-heart" />
                                                </button>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => {
                                                        setOpenDetail(true);
                                                        handleRedirectLayIdDeXemDetail(item._id);
                                                    }}
                                                    title="Xem chi tiết"
                                                >
                                                    <i className="fa-regular fa-eye" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Thông tin sản phẩm */}
                                        <div className="product-content" style={{ fontSize: "14px" }}>
                                            <span className="brand text-muted" style={{ fontSize: "14px" }}>{item.IdHangSX?.TenHangSX}</span>
                                            <a style={{ fontSize: "14px" }}
                                                onClick={() => handleRedirectLayIdDeXemDetailPageUrl(item)}
                                                className="product-name"
                                            >
                                                {item.TenSP}
                                            </a>
                                            <div className="rating-stars my-2" style={{ fontSize: "14px" }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className="fa-solid fa-star text-warning" />
                                                ))}
                                            </div>
                                            <div className="price-section">
                                                <span className="current-price" style={{ fontSize: "14px" }}>
                                                    {Math.ceil(
                                                        item.sizes[0].price - item.sizes[0].price * (item.GiamGiaSP / 100)
                                                    ).toLocaleString()}
                                                    đ
                                                </span>
                                                {item.GiamGiaSP !== 0 && (
                                                    <span className="old-price" style={{ fontSize: "14px" }}>
                                                        {item.sizes[0].price.toLocaleString()}đ
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleRedirectLayIdDeXemDetailPageUrl(item)}
                                                className="view-product-btn"
                                            >
                                                Xem sản phẩm <i className="fa-regular fa-eye ms-2" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Phân trang */}
                    {dataProductToCategory?.length > 0 && (
                        <div className="row justify-content-center mt-5">
                            <Pagination
                                responsive
                                current={current}
                                pageSize={pageSize}
                                total={total}
                                onChange={(p, s) => handleOnchangePage({ current: p, pageSize: s })}
                                showSizeChanger={true}
                                showQuickJumper={true}
                                showTotal={(total, range) => (
                                    <div>{range[0]}-{range[1]} trên {total} sản phẩm</div>
                                )}
                                locale={{
                                    items_per_page: "sản phẩm / trang",
                                    jump_to: "Đến trang",
                                    jump_to_confirm: "Xác nhận",
                                    page: "",
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
            {/* rts grocery feature area end */}

            <ModalViewDetail
                openDetail={openDetail}
                setOpenDetail={setOpenDetail}
                setDataDetailSP={setDataDetailSPModal}
                setIdDetail={setIdDetail}
                dataDetailSP={dataDetailSPModal}
            />

            <div className="rts-shorts-service-area rts-section-gap bg_primary">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-lg-3 col-md-6 col-sm-12 col-12">
                            {/* single service area start */}
                            <div className="single-short-service-area-start">
                                <div className="icon-area">
                                    <svg width={80} height={80} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx={40} cy={40} r={40} fill="white" />
                                        <path d="M55.7029 25.2971C51.642 21.2363 46.2429 19 40.5 19C34.7571 19 29.358 21.2363 25.2971 25.2971C21.2364 29.358 19 34.7571 19 40.5C19 46.2429 21.2364 51.642 25.2971 55.7029C29.358 59.7637 34.7571 62 40.5 62C46.2429 62 51.642 59.7637 55.7029 55.7029C59.7636 51.642 62 46.2429 62 40.5C62 34.7571 59.7636 29.358 55.7029 25.2971ZM40.5 59.4805C30.0341 59.4805 21.5195 50.9659 21.5195 40.5C21.5195 30.0341 30.0341 21.5195 40.5 21.5195C50.9659 21.5195 59.4805 30.0341 59.4805 40.5C59.4805 50.9659 50.9659 59.4805 40.5 59.4805Z" fill="#629D23" />
                                        <path d="M41.8494 39.2402H39.1506C37.6131 39.2402 36.3623 37.9895 36.3623 36.452C36.3623 34.9145 37.6132 33.6638 39.1506 33.6638H44.548C45.2438 33.6638 45.8078 33.0997 45.8078 32.404C45.8078 31.7083 45.2438 31.1442 44.548 31.1442H41.7598V28.3559C41.7598 27.6602 41.1957 27.0962 40.5 27.0962C39.8043 27.0962 39.2402 27.6602 39.2402 28.3559V31.1442H39.1507C36.2239 31.1442 33.8429 33.5253 33.8429 36.452C33.8429 39.3787 36.224 41.7598 39.1507 41.7598H41.8495C43.3869 41.7598 44.6377 43.0106 44.6377 44.548C44.6377 46.0855 43.3869 47.3363 41.8495 47.3363H36.452C35.7563 47.3363 35.1923 47.9004 35.1923 48.5961C35.1923 49.2918 35.7563 49.8559 36.452 49.8559H39.2402V52.6442C39.2402 53.34 39.8043 53.904 40.5 53.904C41.1957 53.904 41.7598 53.34 41.7598 52.6442V49.8559H41.8494C44.7761 49.8559 47.1571 47.4747 47.1571 44.548C47.1571 41.6214 44.7761 39.2402 41.8494 39.2402Z" fill="#629D23" />
                                    </svg>
                                </div>
                                <div className="information">
                                    <h4 className="title">Giá tốt nhất &amp; Ưu đãi</h4>
                                    <p className="disc">
                                        Chúng tôi đã chuẩn bị các mức giảm giá đặc biệt cho các sản phẩm trong cửa hàng.
                                    </p>
                                </div>
                            </div>
                            {/* single service area end */}
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 col-12">
                            {/* single service area start */}
                            <div className="single-short-service-area-start">
                                <div className="icon-area">
                                    <svg width={80} height={80} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx={40} cy={40} r={40} fill="white" />
                                        <path d="M55.5564 24.4436C51.4012 20.2884 45.8763 18 40 18C34.1237 18 28.5988 20.2884 24.4436 24.4436C20.2884 28.5988 18 34.1237 18 40C18 45.8763 20.2884 51.4012 24.4436 55.5564C28.5988 59.7116 34.1237 62 40 62C45.8763 62 51.4012 59.7116 55.5564 55.5564C59.7116 51.4012 62 45.8763 62 40C62 34.1237 59.7116 28.5988 55.5564 24.4436ZM40 59.4219C29.2907 59.4219 20.5781 50.7093 20.5781 40C20.5781 29.2907 29.2907 20.5781 40 20.5781C50.7093 20.5781 59.4219 29.2907 59.4219 40C59.4219 50.7093 50.7093 59.4219 40 59.4219Z" fill="#629D23" />
                                        <path d="M42.4009 34.7622H35.0294L36.295 33.4966C36.7982 32.9934 36.7982 32.177 36.295 31.6738C35.7914 31.1703 34.9753 31.1703 34.4718 31.6738L31.0058 35.1398C30.5022 35.6434 30.5022 36.4594 31.0058 36.9626L34.4718 40.429C34.7236 40.6808 35.0536 40.8067 35.3832 40.8067C35.7132 40.8067 36.0432 40.6808 36.295 40.429C36.7982 39.9255 36.7982 39.1094 36.295 38.6059L35.0291 37.3403H42.4009C44.8229 37.3403 46.7934 39.3108 46.7934 41.7328C46.7934 44.1549 44.8229 46.1254 42.4009 46.1254H37.8925C37.1805 46.1254 36.6035 46.7028 36.6035 47.4145C36.6035 48.1265 37.1805 48.7035 37.8925 48.7035H42.4009C46.2446 48.7035 49.3716 45.5765 49.3716 41.7328C49.3716 37.8892 46.2446 34.7622 42.4009 34.7622Z" fill="#629D23" />
                                    </svg>
                                </div>
                                <div className="information">
                                    <h4 className="title">Chính sách hoàn trả 100%</h4>
                                    <p className="disc">
                                        Chúng tôi đã chuẩn bị các mức giảm giá đặc biệt cho các sản phẩm trong cửa hàng.
                                    </p>
                                </div>
                            </div>
                            {/* single service area end */}
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 col-12">
                            {/* single service area start */}
                            <div className="single-short-service-area-start">
                                <div className="icon-area">
                                    <svg width={80} height={80} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx={40} cy={40} r={40} fill="white" />
                                        <path d="M26.2667 26.2667C29.935 22.5983 34.8122 20.5781 40 20.5781C43.9672 20.5781 47.8028 21.7849 51.0284 24.0128L48.5382 24.2682L48.8013 26.8328L55.5044 26.1453L54.8169 19.4422L52.2522 19.7053L52.4751 21.8787C48.8247 19.3627 44.4866 18 40 18C34.1236 18 28.5989 20.2884 24.4437 24.4437C20.2884 28.5989 18 34.1236 18 40C18 44.3993 19.2946 48.6457 21.7437 52.28L23.8816 50.8393C23.852 50.7952 23.8232 50.7508 23.7939 50.7065C21.69 47.5289 20.5781 43.8307 20.5781 40C20.5781 34.8123 22.5983 29.935 26.2667 26.2667Z" fill="#629D23" />
                                        <path d="M58.2564 27.72L56.1184 29.1607C56.148 29.2047 56.1768 29.2493 56.2061 29.2935C58.3099 32.4711 59.4219 36.1693 59.4219 40C59.4219 45.1878 57.4017 50.065 53.7333 53.7333C50.0651 57.4017 45.1879 59.4219 40 59.4219C36.0328 59.4219 32.1972 58.2151 28.9716 55.9872L31.4618 55.7318L31.1987 53.1672L24.4956 53.8547L25.1831 60.5578L27.7478 60.2947L27.5249 58.1213C31.1754 60.6373 35.5135 62 40 62C45.8764 62 51.4011 59.7116 55.5564 55.5563C59.7117 51.4011 62 45.8764 62 40C62 35.6007 60.7055 31.3543 58.2564 27.72Z" fill="#629D23" />
                                        <path d="M28.7407 42.7057L30.4096 41.1632C31.6739 40 31.9142 39.2161 31.9142 38.3564C31.9142 36.7127 30.5108 35.6633 28.4753 35.6633C26.7305 35.6633 25.4788 36.3966 24.8087 37.5093L26.6673 38.546C27.0213 37.9771 27.6029 37.6863 28.2477 37.6863C29.0063 37.6863 29.3856 38.0276 29.3856 38.5966C29.3856 38.9633 29.2845 39.3679 28.5764 40.0254L25.2639 43.123V44.6907H32.1544V42.7057L28.7407 42.7057Z" fill="#629D23" />
                                        <path d="M40.1076 42.9965H41.4224V41.0115H40.1076V39.507H37.7433V41.0115H35.948L39.5512 35.8404H36.9594L32.9894 41.3655V42.9965H37.6674V44.6906H40.1076V42.9965Z" fill="#629D23" />
                                        <path d="M43.6986 45.955L47.8708 34.045H45.7341L41.5618 45.955H43.6986Z" fill="#629D23" />
                                        <path d="M49.995 39.1908V37.8254H52.3213L49.3375 44.6906H52.0685L55.1913 37.4081V35.8404H47.8582V39.1908H49.995Z" fill="#629D23" />
                                    </svg>
                                </div>
                                <div className="information">
                                    <h4 className="title">Hỗ trợ 24/7</h4>
                                    <p className="disc">
                                        Chúng tôi đã chuẩn bị các mức giảm giá đặc biệt cho các sản phẩm trong cửa hàng.
                                    </p>
                                </div>
                            </div>
                            {/* single service area end */}
                        </div>
                        <div className="col-lg-3 col-md-6 col-sm-12 col-12">
                            {/* single service area start */}
                            <div className="single-short-service-area-start">
                                <div className="icon-area">
                                    <svg width={80} height={80} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx={40} cy={40} r={40} fill="white" />
                                        <path d="M57.0347 37.5029C54.0518 29.3353 48.6248 23.7668 48.3952 23.5339L46.2276 21.3333V29.6016C46.2276 30.3124 45.658 30.8906 44.9578 30.8906C44.2577 30.8906 43.688 30.3124 43.688 29.6016C43.688 23.2045 38.5614 18 32.26 18H30.9902V19.2891C30.9902 25.3093 27.0988 29.646 24.1414 35.2212C21.1581 40.8449 21.3008 47.7349 24.5138 53.2021C27.7234 58.6637 33.5291 62 39.7786 62H40.3686C46.1822 62 51.6369 59.1045 54.9597 54.2545C58.2819 49.4054 59.056 43.0371 57.0347 37.5029ZM52.8748 52.7824C50.0265 56.9398 45.3513 59.4219 40.3686 59.4219H39.7786C34.4416 59.4219 29.4281 56.5325 26.6947 51.8813C23.9369 47.1886 23.8153 41.2733 26.3773 36.4436C29.1752 31.1691 32.9752 26.8193 33.4744 20.662C37.803 21.265 41.1483 25.0441 41.1483 29.6015C41.1483 31.7338 42.8572 33.4687 44.9577 33.4687C47.0581 33.4687 48.767 31.7338 48.767 29.6015V27.9161C50.54 30.2131 53.0138 33.9094 54.6534 38.399C56.3856 43.1416 55.704 48.653 52.8748 52.7824Z" fill="#629D23" />
                                        <path d="M38.6089 40C38.6089 37.8676 36.9 36.1328 34.7996 36.1328C32.6991 36.1328 30.9902 37.8676 30.9902 40C30.9902 42.1324 32.6991 43.8672 34.7996 43.8672C36.9 43.8672 38.6089 42.1324 38.6089 40ZM33.5298 40C33.5298 39.2892 34.0994 38.7109 34.7996 38.7109C35.4997 38.7109 36.0693 39.2892 36.0693 40C36.0693 40.7108 35.4997 41.2891 34.7996 41.2891C34.0994 41.2891 33.5298 40.7108 33.5298 40Z" fill="#629D23" />
                                        <path d="M44.9578 46.4453C42.8573 46.4453 41.1485 48.1801 41.1485 50.3125C41.1485 52.4449 42.8573 54.1797 44.9578 54.1797C47.0583 54.1797 48.7672 52.4449 48.7672 50.3125C48.7672 48.1801 47.0583 46.4453 44.9578 46.4453ZM44.9578 51.6016C44.2577 51.6016 43.688 51.0233 43.688 50.3125C43.688 49.6017 44.2577 49.0234 44.9578 49.0234C45.658 49.0234 46.2276 49.6017 46.2276 50.3125C46.2276 51.0233 45.658 51.6016 44.9578 51.6016Z" fill="#629D23" />
                                        <path d="M32.5466 52.0632L45.2407 36.599L47.1911 38.249L34.4969 53.7132L32.5466 52.0632Z" fill="#629D23" />
                                    </svg>
                                </div>
                                <div className="information">
                                    <h4 className="title">Khuyến mãi lớn Khuyến mãi hàng ngày</h4>
                                    <p className="disc">
                                        Chúng tôi đã chuẩn bị các mức giảm giá đặc biệt cho các sản phẩm trong cửa hàng.
                                    </p>
                                </div>
                            </div>
                            {/* single service area end */}
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default DetailProduct