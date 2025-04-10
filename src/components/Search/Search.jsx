import { Input } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';

const { Search } = Input;

const useTypingEffect = (strings, isTyping) => {
    const [placeholder, setPlaceholder] = useState('');
    const stringIndexRef = useRef(0);
    const charIndexRef = useRef(0);
    const placeholderRef = useRef('');

    useEffect(() => {
        if (!strings || strings.length === 0) return;

        const typingInterval = setInterval(() => {
            if (isTyping) return; // 👉 Ngăn không cập nhật placeholder khi đang gõ

            const currentStr = strings[stringIndexRef.current];
            const nextChar = currentStr[charIndexRef.current];
            placeholderRef.current += nextChar;
            setPlaceholder(placeholderRef.current);
            charIndexRef.current += 1;

            if (charIndexRef.current >= currentStr.length) {
                charIndexRef.current = 0;
                stringIndexRef.current = (stringIndexRef.current + 1) % strings.length;
                placeholderRef.current = '';
            }
        }, 150);

        return () => clearInterval(typingInterval);
    }, [strings, isTyping]);

    return placeholder;
};

const SearchInput = ({ value, onSearchChange, disabled }) => {
    const dataTheLoai = useSelector(state => state.category.listCategorys.data);
    const [isTyping, setIsTyping] = useState(false);

    const strings = dataTheLoai?.map(item => `Tìm kiếm ${item.TenLoaiSP}...`) || [];
    const placeholder = useTypingEffect(strings, isTyping);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setIsTyping(query.trim().length > 0); // Đúng nếu người dùng đang gõ
        onSearchChange(query);
    };

    return (
        <Search
            className="search-header"
            placeholder={placeholder}
            value={value}
            onChange={handleSearchChange}
            enterButton
            disabled={disabled}
            addonAfter={
                <a href="javascript:void(0);" className="rts-btn btn-primary radious-sm with-icon">
                    <div className="btn-text">Search</div>
                    <div className="arrow-icon">
                        <i className="fa-light fa-magnifying-glass" />
                    </div>
                    <div className="arrow-icon">
                        <i className="fa-light fa-magnifying-glass" />
                    </div>
                </a>
            }
        />
    );
};

export default SearchInput;
