import { iconSpecialty } from "@/constants/icon_svg";
import { DoctorConsultModel } from "@/types/DoctorConsultModel";
import { Text, View } from "react-native";

interface Props {
    specialty: DoctorConsultModel;
}

const DoctorSpecialtyCard: React.FC<Props> = ({ specialty }) => {
    const Icon = iconSpecialty[specialty.id as keyof typeof iconSpecialty];
    return (
        <View className="flex justify-center items-center rounded-xl p-6  dark:bg-blue-200 dark:border-blue-300 dark:shadow-blue-300 bg-white shadow-xl border border-gray-100 ">
            <View className="w-8 h-8 drop-shadow text-gray-500 mb-4">{Icon}</View>
            <Text className="text-xl font-bold text-blackmb-2 text-center">
                {specialty.name}
            </Text>
            <Text className="text-gray-600 leading-relaxed text-center">
                {specialty.description}
            </Text>
        </View>
    );
};

export default DoctorSpecialtyCard;