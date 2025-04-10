import SearchInput from '../Search/Search'
import logoTop from '/assets/images/logo-kttt.png'
import iconBaGach from '../../assets/images/icons/14.svg'
import { useDispatch, useSelector } from 'react-redux'
import { fetchListHangSX } from '../../redux/HangSX/hangSXSlice'
import { fetchListCategory } from '../../redux/TheLoai/theLoaiSlice'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SearchMobile from '../Search/SearchMobile'
import { BiLogIn } from "react-icons/bi";
import { MdLogout } from "react-icons/md";
import { handleLogout } from '../../services/loginKHAPI'
import { Button, Col, message, Row } from 'antd'
import { doLogoutAction } from '../../redux/accKH/accountSlice'
import { doDeleteItemCartAction, doLogoutActionCart } from '../../redux/order/orderSlice'
import { doLogoutActionWishlist } from '../../redux/wishlist/wishlistSlice'
import "./header.css"
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

const Header = () => {

    const dispatch = useDispatch()
    const dataTheLoai = useSelector(state => state.category.listCategorys.data)
    // const dataHangSX = useSelector(state => state.hangSX.listHangSXs.data)
    const isAuthenticated = useSelector((state) => state.accountKH.isAuthenticated);
    const order = useSelector((state) => state.order);
    const wishList = useSelector((state) => state.wishlist.Wishlist);
    console.log("isAuthenticated: ", isAuthenticated);
    console.log("order: ", order);
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = () => {
        setShowMenu((prev) => !prev);
    }
    const [searchQuery, setSearchQuery] = useState('');
    // const [searchQueryMobile, setSearchQueryMobile] = useState('');
    const navigate = useNavigate()

    const location = useLocation();  // Lấy thông tin location hiện tại
    const queryParams = new URLSearchParams(location.search);
    let idLoaiSP = queryParams.get('IdLoaiSP')

    const customerId = useSelector(state => state.accountKH.user._id)
    const user = useSelector(state => state.accountKH.user)

    const handleSearchChange = (query) => {
        setSearchQuery(query);

        if (typeof query === 'string') {
            // Tạo URLSearchParams từ query string hiện tại
            const searchParams = new URLSearchParams(location.search);

            // Cập nhật lại query parameter 'TenSP'
            searchParams.set('TenSP', query);

            // Nếu 'IdLoaiSP' đã có trong query params, giữ nguyên nó
            if (idLoaiSP) {
                searchParams.set('IdLoaiSP', idLoaiSP);  // Giữ 'IdLoaiSP' trong query string
            }

            if (location.pathname === '/mycart' || location.pathname === '/wishlist' || location.pathname === '/myaccount'
                || location.pathname === '/checkout') {
                navigate(`/all-product?${searchParams.toString()}`);
                // Cuộn về đầu trang
                window.scrollTo({ top: 500, behavior: 'smooth' });
            } else {
                // Otherwise, update the current URL with the new query string
                navigate(`${location.pathname}?${searchParams.toString()}`);
                // Cuộn về đầu trang
                window.scrollTo({ top: 500, behavior: 'smooth' });
            }

            // Điều hướng tới URL mới với 'TenSP' và 'IdLoaiSP'
            // navigate(`${location.pathname}?${searchParams.toString()}`);
        }
    };

    const handleSearchChange1 = (query) => {
        setSearchQuery(query);
        // Kiểm tra giá trị của query để đảm bảo nó là chuỗi
        if (typeof query === 'string') {
            if (window.location.pathname === "/") {
                navigate(`/?TenSP=${encodeURIComponent(query)}`); // Nếu đang ở trang home
            } else if (window.location.pathname === "/all-product") {
                navigate(`/all-product?TenSP=${encodeURIComponent(query)}`); // Nếu đang ở trang all-product
            } else if (window.location.pathname === `/all-product-category?IdLoaiSP=${idLoaiSP}`) {
                navigate(`/all-product-category?IdLoaiSP=${idLoaiSP}&TenSP=${encodeURIComponent(query)}`); // Nếu đang ở trang all-product
            }
        }
    };
    const handleSearchChangeMobile = (query) => {
        setSearchQuery(query);

        if (typeof query === 'string') {
            // Tạo URLSearchParams từ query string hiện tại
            const searchParams = new URLSearchParams(location.search);

            // Cập nhật lại query parameter 'TenSP'
            searchParams.set('TenSP', query);

            // Nếu 'IdLoaiSP' đã có trong query params, giữ nguyên nó
            if (idLoaiSP) {
                searchParams.set('IdLoaiSP', idLoaiSP);  // Giữ 'IdLoaiSP' trong query string
            }

            if (location.pathname === '/mycart' || location.pathname === '/wishlist' || location.pathname === '/myaccount'
                || location.pathname === '/checkout') {
                navigate(`/all-product?${searchParams.toString()}`);
                // Cuộn về đầu trang
                window.scrollTo({ top: 600, behavior: 'smooth' });
            } else {
                // Otherwise, update the current URL with the new query string
                navigate(`${location.pathname}?${searchParams.toString()}`);
                // Cuộn về đầu trang
                window.scrollTo({ top: 1880, behavior: 'smooth' });
            }

            // Điều hướng tới URL mới với 'TenSP' và 'IdLoaiSP'
            // navigate(`${location.pathname}?${searchParams.toString()}`);
        }
    };

    const logoutClick = async () => {
        const res = await handleLogout()
        if (res) {
            dispatch(doLogoutAction())
            dispatch(doLogoutActionCart())
            dispatch(doLogoutActionWishlist())
            message.success(res.message)
            navigate('/')
        }
    }

    useEffect(() => {
        dispatch(fetchListHangSX())
        dispatch(fetchListCategory())
    }, [dispatch])

    const handleRedirectLayIdDeXemDetailPageUrl = (item) => {
        console.log("id: ", item);
        // Lấy các _id từ mảng idLoaiSP và chuyển thành chuỗi
        const idLoaiSPString = item.IdLoaiSP.map(loai => loai._id).join(',');
        window.location.href = `/detail-product?id=${item._id}&idLoaiSP=${idLoaiSPString}`
        // navigate(`/detail-product?id=${item._id}&idLoaiSP=${idLoaiSPString}`)
    }

    const deleteCartAProduct = (productId, size) => {
        console.log("productId, size: ", productId, size);

        dispatch(doDeleteItemCartAction({ productId, size, customerId }))
    }
    return (
        <>
            <header className="Header_banner_Top">
                <div className="row banner">
                    <div className="col-4">
                        <img className='Banner_top' src="https://cdn2.cellphones.com.vn/x/https://dashboard.cellphones.com.vn/storage/Top banner_Chinh hang.svg" alt="" />
                    </div>
                    <div className="col-4">
                        <img className='Banner_top' src="https://cdn2.cellphones.com.vn/x/https://dashboard.cellphones.com.vn/storage/Top%20banner_Smember.svg" alt="" />
                    </div>
                    <div className="col-4">
                        <img className='Banner_top' src="https://cdn2.cellphones.com.vn/x/https://dashboard.cellphones.com.vn/storage/Top%20banner_Giao%20hang.svg" alt="" />
                    </div>
                </div>
            </header>
            <div className="rts-header-nav-area-one header--sticky">
                <div style={{ backgroundColor: "#d70018", paddingLeft: "100px" }}>
                    <div className="row">
                        <div className="col-lg-2">
                            <div className="logo" onClick={() => navigate("/")}>
                            <a onClick={() => navigate('/')} href='/' className="logo-area">
                                <img
                                    src="https://itviec.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBL0gvRFE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--bdd46b81c23a7bbab719e06011f432a74fbb5896/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFJc0FXa0NMQUU9IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--15c3f2f3e11927673ae52b71712c1f66a7a1b7bd/cellphones-logo.png"
                                    alt="logo"
                                    className="img-fluid" onClick={() => navigate("/")}
                                />
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="nav-and-btn-wrapper">
                                <div className="nav-area-bottom-left-header-four" >
                                    <div className="category-btn category-hover-header five-style" style={{ backgroundColor: "hsla(0, 0%, 100%, .2)" }}                                    >
                                        {/* <img className="parent" src={iconBaGach} alt="icons" /> */}
                                        <span className="ml--10">☰  Danh mục</span>
                                        <ul className="category-sub-menu" id="category-active-four">
                                            {dataTheLoai?.map((item, index) => {
                                                return (
                                                    <li key={index}>
                                                        <a
                                                            onClick={() => {
                                                                message.success(`Trang sản phẩm của ${item.TenLoaiSP}`)
                                                                navigate(`/all-product-category?IdLoaiSP=${item._id}`)
                                                            }}
                                                            className="menu-item"
                                                        >
                                                            <img width={50} src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${item.Image}`} alt="icons" />
                                                            <span>{item.TenLoaiSP}</span>
                                                        </a>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="logo-search-category-wrapper style-five-call-us">
                                <div className="category-search-wrapper style-five">
                                    <SearchInput value={searchQuery} onSearchChange={handleSearchChange} disabled={false} />
                                </div>
                                <div className="accont-wishlist-cart-area-header">
                                    {isAuthenticated === true ?
                                        <a style={{ cursor: "pointer" }} onClick={() => navigate('/myaccount')} className="btn-border-only account">
                                            <i className="fa-light fa-user" />
                                            Tài khoản
                                        </a> : ''}

                                    <a style={{ cursor: "pointer" }} onClick={() => navigate('/wishlist')} className="btn-border-only wishlist">
                                        <i className="fa-regular fa-heart" />
                                        Yêu thích
                                        <span className="number">{wishList?.length}</span>
                                    </a>

                                    <div className="btn-border-only cart category-hover-header" style={{ zIndex: "101" }}>
                                        <i className="fa-sharp fa-regular fa-cart-shopping" />
                                        <span className="text">Giỏ hàng</span>
                                        <span className="number">{order.totalQuantity}</span>

                                        <div className="category-sub-menu card-number-show">
                                            <h5 className="shopping-cart-number">Giỏ hàng đang có ({order.carts.length})</h5>
                                            {order.carts.length > 0 ? (
                                                <>
                                                    {/* Render cart items */}
                                                    {order.carts.map((item, index) => {
                                                        return (
                                                            <div className="cart-item-1 border-top" key={item._id}>
                                                                <div className="img-name">
                                                                    <div className="thumbanil">
                                                                        <img src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${item.detail.Image}`} alt="" />
                                                                    </div>
                                                                    <div className="details">
                                                                        <a onClick={() => handleRedirectLayIdDeXemDetailPageUrl(item.detail)}>
                                                                            <h5 className="title" style={{ color: "#629D23" }}>{item.detail.TenSP}</h5>
                                                                        </a>
                                                                        <div className="number" style={{ fontSize: "15px" }}>
                                                                            Số lượng đặt: <span style={{ color: "blue" }}>{item.quantity}</span>  <br />
                                                                        </div>
                                                                        <span style={{ marginTop: "10px" }}>Cấu hình: {item.sizeDaChon}</span>

                                                                        {item.detail.GiamGiaSP !== 0 ? (
                                                                            <p style={{ color: "red", fontWeight: "500", marginTop: "10px" }}>
                                                                                {Math.ceil(item.priceDaChon - (item.priceDaChon * (item.detail.GiamGiaSP / 100))).toLocaleString()}đ
                                                                                &nbsp;&nbsp;&nbsp;
                                                                                <span style={{ color: "gray", fontWeight: "500" }}>
                                                                                    <s>{item.priceDaChon.toLocaleString()}đ</s>
                                                                                </span>
                                                                            </p>
                                                                        ) : (
                                                                            <p style={{ color: "red", fontWeight: "500", marginTop: "10px" }}>
                                                                                {item.priceDaChon.toLocaleString()}đ
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="close-c1" onClick={() => deleteCartAProduct(item._id, item.sizeDaChon)}>
                                                                    <i className="fa-regular fa-x" />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}


                                                    <div className="sub-total-cart-balance">
                                                        <div className="button-wrapper d-flex align-items-center justify-content-between">
                                                            <a onClick={() => navigate('/mycart')} className="rts-btn btn-primary border-only">Xem chi tiết</a>
                                                            <a onClick={() => navigate('/checkout')} className="rts-btn btn-primary border-only">Đặt hàng</a>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <p>Chưa có sản phẩm trong giỏ hàng</p>
                                            )}

                                        </div>

                                        {/* <a  className="over_link" /> */}
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="col-lg-2">
                            <div className="bwtween-area-header-top header-top-style-four">
                                {!isAuthenticated ?
                                    <>
                                       
                                        <div className="follow-us-social" style={{ cursor: "pointer" }} onClick={() => navigate('/login-web')}>
                                            <BiLogIn size={25} style={{ color: "white" }} /> &nbsp;&nbsp;
                                            <span>Đăng nhập</span>
                                        </div>
                                    </>
                                    :
                                    <>
                                        <div className="follow-us-social" style={{ cursor: "pointer" }} onClick={() => logoutClick()}>
                                            <MdLogout size={25} style={{ color: "white" }} /> &nbsp;&nbsp;
                                            <span>Đăng xuất</span>
                                        </div>
                                    </>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* header style two */}
            <div id="side-bar" className="side-bar header-two">
                <button className="close-icon-menu"><i className="far fa-times" /></button>
                {/* <SearchMobile value={searchQueryMobile} onSearchChange={handleSearchChangeMobile}/> */}
                <div className="mobile-menu-nav-area tab-nav-btn mt--20">
                    <nav>
                        <div className="nav nav-tabs" id="nav-tab" role="tablist">
                            <button className="nav-link active" id="nav-home-tab" data-bs-toggle="tab" data-bs-target="#nav-home" type="button" role="tab" aria-controls="nav-home" aria-selected="true">Menu</button>
                            <button className="nav-link" id="nav-profile-tab" data-bs-toggle="tab" data-bs-target="#nav-profile" type="button" role="tab" aria-controls="nav-profile" aria-selected="false">Danh Mục</button>
                        </div>
                    </nav>
                    
                </div>
            </div>
            {/* header style two End */}

        </>
    )
}
export default Header